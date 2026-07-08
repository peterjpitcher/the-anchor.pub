# Sitewide Opportunity Map — The Anchor, 7 July 2026

Ordered by (commercial value × achievability) ÷ effort. Evidence files cited by name; no invented metrics — no GSC/GA4 this run, so "underperforming pages" cannot be ranked by real positions (that analysis is blocked on the GSC prerequisite, SEO-002).

## A. Measurement gap — blocks everything (Tier-1 prerequisites)

1. **GA4 server-side conversion forwarding unverified.** `app/api/analytics/route.ts:112-113` no-ops silently if `GA4_MEASUREMENT_ID`/`GA4_API_SECRET` are unset in Vercel — flagged open since June, never confirmed (evidence/tracking-evidence.md). If unset, bookings are under-attributed and the entire roadmap is unmeasurable. **Do now.**
2. **No GSC data in this run.** A property existed in June (GSC-backed keyword plans prove it) but no export/service-account was supplied (inputs/input-summary.md). Striking-distance, CTR-gap, cannibalisation-by-data, hotel-page (R2) disposition and all re-measurement are blocked. **Do now: wire `fetch-search-data.py` or manual export.**

## B. Fact-accuracy of the search/AI surface — highest-leverage content work

3. **Stale index copies + on-page drift feed AI answers wrong facts on the #1 commercial priority.** Observed 2026-07-07 (serp-snapshots.md): roast answers repeat retired "pre-order by 1pm Saturday" + "£14.99–£15.99"; wakes answers say "up to 50 guests, £12pp buffet" (SSOT: 10+–150, prices live-only; "up to 50" is live copy at `app/private-hire/wakes/page.tsx:357`); function-room answers repeat banned minimum-spend wording ("£500–1,500"); Christmas answers say "£38pp" and "5 minutes from T5" (SSOT: 7 minutes). Fixes: SSOT-sweep the live pages (wakes capacity phrasing, comparison blog post, distance claims), then request recrawl of the 301'd /sunday-lunch and re-indexed money pages via GSC. Effort Small-Medium, impact High — these answers sit directly in front of roast walk-ins and hire enquiries.

## C. Template/system fixes (one fix, sitewide effect)

4. **Title template doubles the brand and blows the pixel budget sitewide.** `app/layout.tsx:66-67` template `%s | The Anchor Stanwell Moor` + pages that already brand their titles ⇒ 102/237 titles contain "The Anchor" twice, 211/237 exceed 60 chars, 10 contain banned "The Anchor Pub" (incl. the root default title). Examples: /sunday-roast = "Sunday Roast Near Heathrow | The Anchor Pub, Stanwell Moor | The Anchor Stanwell Moor" (evidence/page-metadata.csv). One template/metadata convention fix. Effort Small-Medium, CTR upside on every SERP impression.
5. **Meta-description defects on money pages.** /food-menu "Dishes from 4." and /book-table "Food from 4." — currency symbol lost in live-price interpolation; /private-hire description is broken/truncated ("…for Private hire for 10+ to 150 ") (page-metadata.csv). Small fix, conversion-relevant snippets.
6. **/leave-review linked 473× sitewide through a 3-hop redirect** (internal-link-issues.md, broken-internal-links.csv: 236 rows). Update the footer/nav link target once. (The 244 `cdn-cgi/l/email-protection` 404 rows are a Cloudflare obfuscation artifact — deprioritise.)

## D. Structural / cannibalisation

7. **Private-hire head-intent split across three pages.** /private-hire (H1 "Function Room Hire Near Heathrow & Staines"), /function-room-hire (H1 "Function Room Hire Near Heathrow"), /private-party-venue all chase the same commercial intent (page-metadata.csv). June GSC showed real demand here ("pubs with private rooms in staines" 302 impr). Decide: one canonical head page (/private-hire) + differentiated satellites (rename/refocus /function-room-hire toward "function room" phrasing only, or consolidate). Needs GSC data to pick the keeper — schedule behind SEO-002.
8. **Sitemap shrank from ~319 built pages (June) to 189 sitemap URLs / 240 crawled** (input-summary.md, audit-summary.md). Much is intentional (27 noindexed tag pages, consolidations), but 44 crawled-not-in-sitemap pages include indexable content (blog posts). Technical agent: reconcile the delta, confirm nothing valuable fell out.
9. **Schema estate is bloated and part-broken.** 12,013 typed JSON-LD blocks across 236 pages; 430 missing required fields (e.g. Restaurant missing `address` on homepage/beer-garden); 146 retired FAQ/HowTo rich-result blocks; 9,927 unknown types (schema-validation-summary.md, schema-issues.csv). Fix required fields on money pages first; then prune — schema should match visible content (AI-answer hygiene).

## E. Rich-result / AI-answer opportunities

10. **AI-citation moat exists — formalise it.** The Anchor is already the named entity in AI-style answers for plane-spotting, wakes, pub-near-T5 (serp-snapshots.md). Opportunities: quotable answer blocks (walk-in roast rules, wake logistics, T5 directions/fares) kept fact-perfect on the owning pages; Restaurant/LocalBusiness schema completeness (item 9); dated updates on the two plane-spotting guides. Clusters worth chasing for AI citations: 1, 2, 3, 7. Not worth chasing: generic "restaurants near heathrow" (in-terminal dominated), venue-hire head terms (directory dominated). No AI-referral data exists — impact claims stay Low confidence.

## F. Missing-page gaps (few — the estate is broad)

11. **No dedicated "pre-flight meal / layover" consolidation push yet** — pages exist (/pre-flight-meal, /heathrow-layover-dining) but June body-copy completion is still open for the restaurants/near-heathrow set. Finish editorial (editorial-team) before creating anything new. **No new page creation is recommended this cycle** except what keyword-plan validates; the risk profile here is over-publication (June lesson: thin-page indexation decline), not under-publication.

## G. Conversion-adjacent (flag to UX/CRO agent)

12. **/book-table is the funnel neck** (990 inbound links, booking wizard). June WP5 shipped a CRO panel; verify SALES_CLOSED handling (recent commits) surfaces alternatives (call/other dates) rather than dead-ending. Phone number present sitewide; call-click tracking exists in `lib/gtm-events.ts` but is unverifiable without GA4 access (item 1).

## Underperforming-pages quick-win list

**Blocked on GSC (SEO-002).** June's known striking-distance item — /near-heathrow at pos 6.8 for "pub near heathrow airport" — is the template for this list; regenerate it from a fresh GSC pull the moment access lands.
