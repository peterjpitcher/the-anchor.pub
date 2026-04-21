# SEO Growth Plan — The Anchor, Stanwell Moor
## 21 April 2026 | v2.0 — SEO Powerhouse Consolidated

---

## Executive Summary

The site is growing fast (+60% clicks, +24% impressions in 28 days) but the growth is in the wrong channel. Plane spotting content drives ~430 clicks/month while the three commercial priorities — food bookings, private events, hosted events — are nearly invisible in search. **The strategic challenge is not traffic volume. It is traffic quality, intent alignment, and conversion.**

This plan operates on a three-layer model:

```
Layer 1 — Technical Foundation  (unblock rendering, fix indexing)
    ↓
Layer 2 — Intent Alignment     (CTR fixes, meta rewrites, schema, new pages)
    ↓
Layer 3 — Traffic Conversion    (CTAs, booking UX, conversion paths)
```

The original plan focused almost entirely on Layer 2. This version adds critical Layer 1 work (CSS rendering blocked by robots.txt) and a complete Layer 3 (7 conversion fixes identified by UX/CRO analysis).

---

## Current Position

| Priority | 28d Clicks | 28d Impressions | Key Gap |
|----------|-----------|----------------|---------|
| P1: Food table bookings | ~67 | ~2,500 | /book-table: 174 imp, 0.57% CTR, pos 10.56 |
| P2: Private event bookings | ~1 | ~1,494 | 77 queries, near-zero clicks, pages ranked 20-27 |
| P3: Hosted events | ~12 | ~1,300 | /whats-on at pos 4.45 with 0.73% CTR |
| Traffic engine (plane spotting) | ~430 | ~16,000 | No conversion path to bookings |

---

## Phase 0 — Critical Technical Fix (Deploy Immediately)

### 0.1 Fix CSS blocked by robots.txt
**Impact:** CRITICAL — Google cannot render ANY page properly
- `/*?dpl=*` in robots.txt blocks ~99 CSS files with Vercel `?dpl=` deployment params
- Affects rich result eligibility for every schema enhancement in this plan
- **Fix:** Change `allow` in `app/robots.ts` to `['/', '/_next/static/']` — specificity wins over the wildcard disallow
- **Also add:** `/cdn-cgi/` to disallow array (Cloudflare 404)
- **Full spec:** `docs/gsc-coverage-fix-spec.md`
- **Verify:** GSC robots.txt report → "Request a recrawl", then URL Inspection "Test Live URL" → check Page Resources

### 0.2 Commit deleted test pages + clean references (SEPARATE commit)
- 10 deleted test/debug directories are unstaged deletes (20 files)
- Also update `app/sitemap-page/page.tsx` and `scripts/audit-hero.js` to remove references
- **This is a separate commit from 0.1** — one concern per changeset (workspace convention)

**Why Phase 0 ships first:** Every schema, rich result, and rendering-dependent improvement in this plan is degraded while CSS is blocked. This is the foundation.

---

## Phase 1 — CTR Fixes: Meta Title & Description Rewrites

All rewrites from the SEO Copywriter specialist. Each was written against the current codebase metadata with specific character counts and rationale. Full details in `docs/seo-powerhouse/phase-3-deep-dive/copywriter/page-recommendations.md`.

### P3 — Hosted Events (highest CTR gap)

| Page | Current CTR | Position | Recommended Title | Expected Uplift |
|------|------------|----------|-------------------|----------------|
| `/whats-on` | 0.73% | 4.45 | "Quiz, Karaoke & Bingo Every Week \| The Anchor Pub" (55ch) | +40-50 clicks/mo |
| `/karaoke` | 0% | 9.31 | "Karaoke Fridays Near Heathrow \| Free Entry \| The Anchor" (54ch) | +5-10 clicks/mo |
| `/quiz-night` | 1.69% | 8.93 | "Pub Quiz Near Heathrow \| £3 Entry, Cash Prizes \| The Anchor" (55ch) | +5 clicks/mo |
| `/music-bingo` | 1.45% | 10.8 | "Music Bingo Near Heathrow \| Win Every Round \| The Anchor" (60ch) | +3-5 clicks/mo |

### P1 — Food Bookings

| Page | Current CTR | Position | Recommended Title | Expected Uplift |
|------|------------|----------|-------------------|----------------|
| `/book-table` | 0.57% | 10.56 | "Book a Table Near Heathrow \| Sunday Roast \| The Anchor" (57ch) | +8-12 clicks/mo |
| `/sunday-lunch` | 1.31% | 9.78 | "Sunday Roast Near Heathrow \| From £19 \| Book by Saturday" (58ch) | +5-8 clicks/mo |
| `/food-menu` | 2.38% | 6.83 | No title change — add "Book a Table" to description | +3-5 clicks/mo |

### P2 — Private Events

| Page | Current CTR | Position | Recommended Title |
|------|------------|----------|-------------------|
| `/private-hire/wakes` | 0.57% | 25.58 | "Wake & Funeral Reception Venue \| Near Heathrow \| The Anchor" (60ch) |
| `/private-hire/christenings` | — | — | "Christening Venue Near Heathrow & Staines \| The Anchor" (60ch) |

### Brand & Local

| Page | Current CTR | Position | Recommended Title |
|------|------------|----------|-------------------|
| `/stanwell-pub` | 0.17% | 4.07 | "The Anchor \| Stanwell Moor Pub \| Rated 4.6★ on Google" (55ch) |
| `/near-heathrow` | 0.78% | 12.76 | "Pub Near Heathrow Airport \| 7 Mins from T5 \| The Anchor" (57ch) |
| `/live-sport` | 0.50% | 8.62 | "Watch Live Sport Near Heathrow \| Big Screens \| The Anchor" (58ch) |
| `/` (homepage) | 0.46% | 7.5 | "The Anchor Pub \| Stanwell Moor \| Near Heathrow" (52ch) |

**Projected uplift from meta rewrites: +70-90 clicks/month** (based on current impressions x target CTR at current positions. Actual results depend on Google re-evaluating snippets, impression stability, and seasonal variation.)

---

## Phase 2 — Conversion Path Fixes (Layer 3)

These are the UX/CRO findings. The site is generating impressions and some clicks, but the conversion paths are broken or missing. Full report in `docs/seo-powerhouse/phase-3-deep-dive/ux-cro/report.md`.

### 2.1 Blog template: Add conditional food/booking CTAs (HIGH impact)
- **Problem:** ~430 clicks/month from plane spotting land on blog posts with only "Get Directions" and "More Stories" as CTAs. Zero commercial exit.
- **Fix:** Add contextual mid-content CTA block to blog template, **conditional on post tags** — only show on posts tagged `heathrow`, `plane-spotting`, `food`, or `near-heathrow`. Do not add to all 100+ posts (many are topically irrelevant).
- **CTA copy:** Source prices from `SSOT.json`, not hardcoded values. E.g. "Visiting Heathrow? The Anchor is 5 minutes away — grab lunch in our beer garden."
- **Footer CTAs:** Replace "Get Directions / More Stories" with "View Food Menu / Book a Table / Get Directions" (also conditional on tags).
- **Note:** Content Strategist confirmed the `/plane-spotting-heathrow` landing page already has booking CTAs. The gap is in the blog template used by `/blog/heathrow-plane-spotting-locations` (262 clicks/28d).

### 2.2 /food-menu: Add "Book a Table" to footer CTA (HIGH impact, XS effort)
- **Problem:** Footer CTASection has "Call" and "View Drinks Menu" but no booking button. The highest-traffic food page (41 clicks/28d) sends users to drinks, not bookings.
- **Fix:** Add `BookTableButton` as third button in CTASection.
- **Also fix on:** `/food-menu/gluten-free` (same issue noted in original plan)

### 2.3 /book-table: Swap hero CTA priority (MEDIUM impact, XS effort)
- **Problem:** Hero `primaryCta` is a phone button. The booking form — the actual conversion goal — is below the fold.
- **Fix:** Make "Book Online Now" (anchor to `#booking-form`) the primary CTA; phone becomes secondary.

### 2.4 /private-hire/wakes: Reuse existing enquiry component (MEDIUM impact, S effort)
- **Problem:** "Enquire Online" navigates to `/private-hire#enquiry` — a different page. Bereaved families lose context.
- **Fix:** Reuse the existing `PrivateHireEnquiry` component from `/private-hire`, mounting it directly on the wakes page. **Must preserve:** Turnstile spam protection, validation, and management API proxy routing. Do not create new form/API surface.
- **Fallback:** If the component isn't embeddable, use deep link `/private-hire?source=wakes#enquiry` with page context preserved.

### 2.5 /quiz-night: Pre-fill booking date (MEDIUM impact, S effort)
- **Problem:** BookTableButton goes to generic form with no date. Users who want "next quiz night" land on a blank form.
- **Prerequisite:** Verify `app/book-table/page.tsx` reads `date` and `purpose` from searchParams before implementing.
- **Fix:** Pass next event date as `/book-table?date=YYYY-MM-DD&purpose=drinks`.
- **Fallback:** If date is unavailable or params unsupported, link to generic `/book-table` without prefill.

### 2.6 /whats-on: Add per-event booking links (MEDIUM impact, S effort)
- **Problem:** Events are listed but there's no "Reserve a table for this night" on individual cards.
- **Fix:** Add event-date booking links on cards. Sticky banner: "Coming to Quiz Night? Book Your Table."
- **Stale-date handling:** Past events = no booking CTA. Cancelled events = "Cancelled" badge. Unavailable dates = generic `/book-table` link without date prefill. Management API failure = graceful degradation to phone CTA.

### 2.7 /sunday-lunch: Add price to hero (LOW-MEDIUM impact, XS effort)
- **Problem:** "From £19" is in the Google snippet but not confirmed in the hero. Trust gap on landing.
- **Fix:** Add "From £19pp" as a hero badge.

---

## Phase 3 — Content & New Pages

### 3.1 Add 4 new landmarks to `lib/local-seo-data.ts` (S effort, HIGH impact)
The `/private-hire/near/[slug]` template auto-generates pages from this data file. The slough-crematorium page is the best performer in all of P2 (5.98% CTR). Adding entries creates new pages with zero template work.

| New Landmark | Location | Target Keywords |
|-------------|----------|----------------|
| `kempton-park-crematorium` | Hanworth TW13 | "wake venue near Kempton Park crematorium" |
| `windsor-register-office` | Windsor SL4 | "private hire near Windsor", "event venue Windsor" |
| `heathrow-airport` | TW6 | "private hire near Heathrow", "corporate venue" |
| `spelthorne-registration-office` | Staines TW18 | "private hire near Staines", "event venue Staines" |

### 3.2 Expand /private-hire/wakes content (S effort, HIGH impact)
- Currently at position 25 — needs to reach top 10
- Add 2 crematorium-proximity H2 sections (~240 words): "Near Slough Crematorium" and "Near Staines Cemetery"
- Update meta description to include Slough and Staines Cemetery
- Add internal link to `/food-menu` in catering packages section
- Tone: empathetic, dignified, practical — phone-first CTA

### 3.3 Fix /private-hire hub title cannibalisation (XS effort)
- `/private-hire` and `/function-room-hire` both target "function room hire heathrow" in their titles
- **Fix:** Change `/private-hire` title to "Private Hire Venue Near Heathrow | Wakes, Parties & Events | The Anchor" — positions as hub, removes keyword overlap

---

## Phase 4 — Schema & Structured Data

### 4.1 Add EventVenue schema to /private-hire hub
- Currently only BreadcrumbJsonLd — missing parent venue schema
- Add EventVenue with capacity, amenities, ReserveAction

### 4.2 Add Restaurant/Menu schema to dietary sub-pages
- `/food-menu/gluten-free`, `/vegan`, `/vegetarian` only have FAQPage schema
- Add Restaurant + Menu schema to match main `/food-menu`

### 4.3 Add EventSeries schema to /live-music
- Quiz night and bingo pages have EventSeries — live music does not
- Add recurring event series schema for regular live music nights

### 4.4 Strengthen homepage LocalBusiness schema
- Add `sameAs` links to Google Business Profile, Facebook, etc.
- Verify `aggregateRating` is present
- Helps with "the anchor pub" brand query (438 imp, pos 7.5, 0.46% CTR)

### Acceptance criteria for all Phase 4 schema work
Each schema addition must pass the [Google Rich Results Test](https://search.google.com/test/rich-results) and [Schema.org Validator](https://validator.schema.org/) before deployment.

---

## Phase 5 — Indexing Cleanup

### 5.1 Fix 4 redirect chains (XS effort)
- Update sources in `config/redirects/wix-redirects.json` to point directly to `/live-sport`
- Affected: `/post/euro-2024-*` and `/post/autumn-internationals-*`

### 5.2 Clean 29 duplicate redirect entries (S effort)
- Remove dead entries from `blog-redirects.json` where wix-redirects already handles the path

### 5.3 Update STATIC_LAST_MODIFIED in sitemap.ts
- Currently hardcoded to 2026-03-20 — update to 2026-04-21

### 5.4 Review 8 single-post blog tags
- Cross-reference against `lib/tag-seo-content.ts` — curated SEO pages stay indexed, auto-generated thin tags get `noindex`

---

## Priority Execution Order

| # | Action | Phase | Effort | Impact | Priority |
|---|--------|-------|--------|--------|----------|
| 1 | Fix CSS robots.txt blocking | 0.1 | XS | **CRITICAL** | P0 — unblocks everything |
| 2 | Commit deleted test pages + clean robots.ts | 0.2 | XS | Medium | P0 |
| 3 | Add food/booking CTAs to blog template | 2.1 | S | **HIGH** | P1 — ~430 clicks/mo with no commercial exit |
| 4 | Add "Book a Table" to /food-menu footer CTA | 2.2 | XS | **HIGH** | P1 |
| 5 | Rewrite /whats-on meta title/description | 1 | XS | **HIGH** | P3 — +40-50 clicks/mo |
| 6 | Rewrite /stanwell-pub meta title | 1 | XS | **HIGH** | Brand — worst CTR gap |
| 7 | Rewrite /karaoke meta title | 1 | XS | Medium | P3 |
| 8 | Rewrite /book-table meta title | 1 | XS | **HIGH** | P1 |
| 9 | Add 4 landmarks to local-seo-data.ts | 3.1 | S | **HIGH** | P2 — instant new pages |
| 10 | Swap /book-table hero CTA (phone → form) | 2.3 | XS | Medium | P1 |
| 11 | All remaining meta rewrites (8 pages) | 1 | S | **HIGH** | All |
| 12 | Expand /private-hire/wakes content | 3.2 | S | **HIGH** | P2 |
| 13 | Fix /private-hire title cannibalisation | 3.3 | XS | Medium | P2 |
| 14 | Embed wakes enquiry form | 2.4 | S | Medium | P2 |
| 15 | Pre-fill quiz-night booking date | 2.5 | S | Medium | P3 |
| 16 | Per-event booking links on /whats-on | 2.6 | S | Medium | P3 |
| 17 | Add £19 badge to /sunday-lunch hero | 2.7 | XS | Low-Med | P1 |
| 18 | EventVenue schema on /private-hire | 4.1 | S | Medium | P2 |
| 19 | Restaurant schema on dietary pages | 4.2 | S | Medium | P1 |
| 20 | EventSeries schema on /live-music | 4.3 | XS | Medium | P3 |
| 21 | Homepage LocalBusiness schema | 4.4 | S | Medium | Brand |
| 22 | Fix redirect chains | 5.1 | XS | Low | Cleanup |
| 23 | Clean duplicate redirects | 5.2 | S | Low | Cleanup |
| 24 | Update sitemap STATIC_LAST_MODIFIED | 5.3 | XS | Low | Cleanup |
| 25 | Review single-post blog tags | 5.4 | S | Low | Cleanup |

---

## 90-Day Success Metrics

| Metric | Current (28d) | 30-Day Target | 90-Day Target |
|--------|--------------|---------------|---------------|
| Daily clicks | 44.3 | 52+ | 65+ |
| P1 food booking clicks | ~67 | 90+ | 130+ |
| P2 private hire clicks | ~1 | 8+ | 15+ |
| P3 hosted events clicks | ~12 | 20+ | 25+ |
| /whats-on CTR | 0.73% | 4%+ | 6%+ |
| /book-table position | 10.56 | <9 | <7 |
| /private-hire/wakes position | 25.58 | <18 | <12 |
| CSS blocked by robots.txt | ~99 URLs | 0 | 0 |
| Blog → booking conversion | 0% | 1%+ | 2%+ |

---

## What NOT To Do

- Don't create more blog posts — the site has 100+ and needs to convert existing traffic
- Don't touch plane spotting content — it's working, protect the rankings
- Don't add more redirects — 684 is already excessive
- Don't write seasonal event content unless The Anchor is confirmed to be running the event
- Don't change URLs of any currently-ranking pages
- Don't target "restaurants near heathrow" or "pub near heathrow" head terms — aggregators own them
- Don't optimise for impressions or rankings without tying to booking completions

---

## Supporting Documents

| Document | Location |
|----------|----------|
| Strategy document | `docs/seo-powerhouse/phase-1-strategy/strategy-document.md` |
| Keyword framework | `docs/seo-powerhouse/phase-1-strategy/keyword-framework.md` |
| Opportunity map | `docs/seo-powerhouse/phase-1-strategy/opportunity-map.md` |
| Competitor landscape | `docs/seo-powerhouse/phase-1-strategy/competitor-landscape.md` |
| Meta copy recommendations | `docs/seo-powerhouse/phase-3-deep-dive/copywriter/page-recommendations.md` |
| UX/CRO report | `docs/seo-powerhouse/phase-3-deep-dive/ux-cro/report.md` |
| Content strategy report | `docs/seo-powerhouse/phase-2-discovery/content-strategy/report.md` |
| GSC coverage fix spec | `docs/gsc-coverage-fix-spec.md` |
