# Developer review: site growth specification set

**Review date:** 26 August 2026  
**Audience:** developer and delivery owner  
**Documents reviewed:**

- `site-growth-spec-2026-08-17.md`
- `site-growth-implementation-spec-2026-08-17.md`
- `keyword-plan-2026-08-17-site-growth.md`

The three documents were reviewed as one specification set. They were treated as evidence and proposed requirements, not as instructions to change the site.

## Overall assessment

**Readiness: not ready to use as the authoritative delivery specification.**

The broad direction is useful. Removing repeated titles, consolidating weak hotel pages, improving internal links, correcting schema, and focusing content on real customer needs are sensible themes.

The specification is not safe to execute as written because:

1. It gives two different destinations for the hotel-page redirects.
2. Its redirect audit proved only that redirects ended on a `200`, not that they reached the intended page. A later repository fix found 232 concrete `/post/*` redirects were shadowed.
3. It repeatedly treats Google Ads competition as organic SEO difficulty.
4. The past-event rule changes between documents and cannot be implemented from the current event-list API as described.
5. Several phase gates conflict with their own scope or sequence.
6. The repository has already implemented part of the programme, so the file list, estimates and remaining work are stale.
7. Accessibility, dependency failure, security, deployment ownership and immediate production monitoring are not acceptance criteria.

Before more work is assigned, create a short, current change register from the present branch. Keep the strategy documents as background evidence.

## Priority and status definitions

- **P0:** blocks approval or can cause material loss if implemented incorrectly.
- **P1:** must be resolved before the affected phase ships.
- **P2:** should be resolved during delivery.
- **P3:** optional improvement.
- **Confirmed issue:** a contradiction, missing requirement or demonstrated problem.
- **Optional improvement:** not required for correctness, but would simplify delivery or reduce future risk.

## Review basis

The review also checked the current repository and current official guidance:

- Google says Keyword Planner competition is the number of advertisers showing for a keyword relative to other keywords. It is not an organic-ranking difficulty score: [Google Ads Keyword Planner metrics](https://support.google.com/google-ads/answer/3022575?hl=en-uk).
- Google does not set a fixed character limit for titles or meta descriptions. Both are shortened as needed for the device: [title guidance](https://developers.google.com/search/docs/appearance/title-link) and [snippet guidance](https://developers.google.com/search/docs/appearance/snippet).
- Google supports its event search experience on pages focused on one event, not listing pages containing many events: [Event structured data](https://developers.google.com/search/docs/appearance/structured-data/event).
- FAQ rich results are normally limited to authoritative government and health sites: [FAQ rich-result change](https://developers.google.com/search/blog/2023/08/howto-faq-changes).
- Google recommends keeping permanent redirects for at least one year and monitoring both old and new URLs: [site move guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes).
- Google uses sitemap `lastmod` only when it is consistently accurate and reflects a significant content change: [sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
- Next.js title templates apply to child route segments, and `title.absolute` bypasses parent templates: [Next.js metadata documentation](https://nextjs.org/docs/app/api-reference/functions/generate-metadata).

## Confirmed issues

### F01. The hotel redirect destination contradicts itself

- **Relevant section:** Growth spec, “P0: consolidate the 11 hotel pages” and “Implementation sequence”; keyword plan, “Headline findings 1”, “Per-cluster implementation guidance 4” and “Measurement plan”; implementation spec, C6.
- **Description:** The corrected strategy and C6 say the 11 `/pub-near-*` pages must redirect to `/heathrow-hotels-pub`, which stays live. Other sections still say 12 pages, including `/heathrow-hotels-pub`, should redirect to `/restaurants-near-heathrow`.
- **Rationale:** These are mutually exclusive migrations. One preserves the hotel hub; the other deletes it.
- **Impact:** A developer following the wrong section could delete 1,187 words of unique content and send every old hotel URL to the wrong page.
- **Recommended action:** Declare C6's 11-entry mapping to `/heathrow-hotels-pub` as the only approved mapping. Mark every conflicting paragraph as superseded. Put the exact mapping in one machine-readable manifest used by code and tests.
- **Open questions:** Should any hotel URL redirect to a named section anchor on the hub? Does `/restaurants-near-heathrow` need only a normal contextual link from the hub?
- **Priority:** P0
- **Type:** Confirmed issue, contradiction, migration

### F02. The redirect audit tested the wrong success condition

- **Relevant section:** Growth spec, “What is already healthy” and P3 housekeeping; implementation spec, G2 and G7.
- **Description:** The documents say all redirects are healthy because they end on `200` pages. Repository commit `6eb94344` later proved that a catch-all `/post/:slug -> /blog` rule ran before 232 concrete rules. At least 172 old post URLs reached the generic blog index instead of the matched article.
- **Rationale:** “Ends on 200” does not prove “reaches the intended equivalent page”. It also misses soft-404-like redirects and precedence errors.
- **Impact:** Link relevance and existing search signals can be lost while every test still passes.
- **Recommended action:** Rebuild the redirect audit around an expected source-to-destination map. For every rule, assert the winning rule, status, exact final URL, hop count, query handling and final indexability. Test pattern-versus-concrete precedence. Fail on duplicate sources with different destinations.
- **Open questions:** Is there a reviewed source-of-truth destination for every legacy URL? Which query parameters must be preserved or dropped?
- **Priority:** P0
- **Type:** Confirmed issue, testing, migration

### F03. Paid-ad competition is being used as organic difficulty

- **Relevant section:** Keyword plan throughout; growth spec parking, Halloween and themed-quiz recommendations.
- **Description:** The documents call terms “winnable”, “unwinnable” or “uncontested” mainly from Google Ads competition index and top-of-page bids.
- **Rationale:** Google defines this metric in terms of advertisers, not organic results. A term with no advertisers may still have strong organic publishers, a local pack, video results or a different intent. A high paid score does not prove organic results cannot be won.
- **Impact:** The programme can prioritise the wrong pages, remove working targeting, or promise traffic that the site cannot obtain.
- **Recommended action:** Relabel the metric as **paid competition**. Before approving an organic target, record the live UK SERP, result types, local-pack presence, search intent, current site ranking, competing domains and content gap. Use an organic difficulty source only as supporting evidence, not as a decision by itself.
- **Open questions:** Were the GKP rows exact-match ideas or grouped variants? What location, device and date were used for the organic SERP review?
- **Priority:** P0
- **Type:** Confirmed issue, data, SEO assumption

### F04. “No GKP data” is treated as “no demand” inconsistently

- **Relevant section:** Keyword plan, hotel and landmark findings; growth spec, hotel consolidation.
- **Description:** The hotel section says there is no demand because GKP returned no data. The landmark section correctly says GKP is blind below its reporting floor and uses GSC instead. The same limitation must apply to both. Later repository evidence records 29 clicks to the hotel-page family over 16 months, so demand was not zero.
- **Rationale:** Missing planner data means unknown or below the planner threshold, not zero.
- **Impact:** Pages can be deleted on an overstated conclusion. The migration may still be right because of duplication, but the stated evidence is wrong.
- **Recommended action:** Change every “no demand” statement to “no measurable GKP volume”. Use GSC page and query data, backlinks, conversions and direct traffic to decide disposition. Base the hotel deletion on duplication and weak business value, not on zero demand.
- **Open questions:** What were clicks, impressions, conversions and backlinks for each of the 11 pages before the redirects? Did any hotel page rank for a useful non-hotel query?
- **Priority:** P1
- **Type:** Confirmed issue, data interpretation

### F05. The past-event quality rule changes between documents

- **Relevant section:** Growth spec, “P0: cut the event page tail”; implementation spec, C11.
- **Description:** The growth spec retires a past event under 350 rendered words or with a duplicate title. C11 uses an empty or under-400-character `long_description`, or a description with the same length as another. These tests are not equivalent. Equal character length is not proof of duplicate text.
- **Rationale:** A 400-character threshold is much smaller than 350 rendered words. The two versions will retire different pages.
- **Impact:** The wrong event pages may be redirected, or the developer may choose a rule without owner approval.
- **Recommended action:** Decide whether this is a fixed historical list or an ongoing automatic policy. For the approved 18, use an explicit allowlist/manifest with destination and reason. For future automation, define a normalized text hash or measured similarity method, minimum useful content, title test, exceptions and human review.
- **Open questions:** Is automatic future retirement actually required? Who reviews borderline pages? What makes a themed recap worth keeping?
- **Priority:** P0
- **Type:** Confirmed issue, contradiction, functional logic

### F06. C11 cannot use the required data from the current list API

- **Relevant section:** Implementation spec, C11; sitemap and event-list flows.
- **Description:** C11 says the quality floor lives in `lib/event-seo-strategy.ts` and affects sitemap inclusion and redirects. The current event list payload does not supply the full `long_description` needed by the rule. The repository now uses a fixed list for this reason.
- **Rationale:** Fetching every event detail to decide sitemap membership creates an N+1 dependency and can make sitemap generation slow or fragile.
- **Impact:** The requirement is not implementable in the stated two files without an API contract change, a fixed manifest, or many extra API calls.
- **Recommended action:** Prefer a fixed reviewed retirement manifest now. If an ongoing rule is required, add the required quality fields or a server-computed quality flag to the management API list response. Define pagination, caching, timeout and failure behaviour.
- **Open questions:** Can the management API add a content hash, word count and last-updated value? Who owns that API change?
- **Priority:** P0
- **Type:** Confirmed issue, integration, performance

### F07. The specification is already stale against the delivery branch

- **Relevant section:** Implementation spec status, totals and full change register.
- **Description:** The document says “ready to build”, but the current branch already contains implementations for several phases. The branch differs from `main` across 110 files, not roughly 75. Some listed work was already handled differently, including the five legacy blog posts, which were already noindex historical updates rather than deletion candidates.
- **Rationale:** A change register must describe remaining work from a known baseline.
- **Impact:** Work may be repeated, reverted or estimated twice. Developers cannot tell which acceptance criteria still apply.
- **Recommended action:** Freeze these documents as strategy records. Create a new remaining-work register from the current commit, with each C item marked done, partly done, superseded or pending. Record the exact base and target commits.
- **Open questions:** Which branch is intended for deployment? Which already-implemented changes have owner approval? Is the uncommitted themed-quiz edit part of this programme?
- **Priority:** P0
- **Type:** Confirmed issue, delivery, configuration management

### F08. The phase order makes some gates impossible

- **Relevant section:** Implementation spec, C2, C6, C15, G1, G4 and G5.
- **Description:** C2 says the 11 hotel titles are “moot” because C6 deletes them, but C6 is in the next phase and G1 requires zero doubled titles before that deletion. C15 still counts descriptions on the already-deleted hotel pages. G4 requires every sitemap page to have at least three inbound links although C14 does not cover every dynamic event. G5 says breadcrumbs are present site-wide while C16 does not define every route family.
- **Rationale:** A gate must be achievable by the work before it.
- **Impact:** Delivery either fails a correct gate or quietly weakens the gate after implementation.
- **Recommended action:** Recalculate scope after every destructive phase. Either move C6 before G1 or temporarily fix those 11 titles. Re-crawl before C15. Replace G4 and G5 with route-family-specific, measurable criteria.
- **Open questions:** Do navigation and footer links count as inbound links? Are noindex and utility pages in the breadcrumb scope?
- **Priority:** P1
- **Type:** Confirmed issue, sequencing, testing

### F09. The title rules contradict the event-title requirement

- **Relevant section:** Implementation spec, C2, C3 and C12.
- **Description:** C2/C3 say no page-level title may contain “The Anchor” and no resolved title may contain it twice. C12's required title is `Quiz Night at The Anchor, Stanwell Moor, 7 October 2026`, which receives the root suffix and contains the brand twice. Titles already containing a date could also receive a second date.
- **Rationale:** A global text rule cannot handle legitimate brand use, `title.absolute`, social titles and dynamic CMS titles without defined exceptions.
- **Impact:** The guard test will either fail on the required output or be weakened until it no longer checks every route.
- **Recommended action:** Define a single idempotent event-title builder. Specify the HTML title separately from Open Graph and Twitter titles. Test the final rendered `<title>` after all layout templates, with explicit exceptions for `title.absolute` and the home page. Do not use a blanket ban on the words “The Anchor”.
- **Open questions:** Must event titles include the venue name before the root suffix? What happens when the CMS title already contains the full date?
- **Priority:** P1
- **Type:** Confirmed issue, metadata, testing

### F10. The 60-character title gate is presented as a hard platform rule

- **Relevant section:** Growth spec title defect; implementation spec C2, C3 and G1.
- **Description:** The specification requires every resolved title to be at most 60 characters. Google has no fixed character limit and shortens titles to the available device width. The current repository guard had to become a 75-character ratchet and still records 42 long blog titles.
- **Rationale:** Character count is a useful editorial warning, not a reliable correctness rule. Letter widths and query rewrites vary.
- **Impact:** A hard build failure can block unrelated releases or encourage vague titles that lose useful meaning.
- **Recommended action:** Keep doubled-brand detection as an error. Treat title length as a warning or reviewed exception, ideally using estimated pixel width. Set a lower target for important acquisition pages and a ratchet for the long blog tail.
- **Open questions:** Which route families genuinely need a hard cap? Who approves exceptions?
- **Priority:** P2
- **Type:** Confirmed issue, test design, SEO

### F11. Meta-description counts and acceptance rules are inconsistent

- **Relevant section:** Growth spec “Meta descriptions”; implementation spec C15 and G5.
- **Description:** The growth spec says 75 descriptions are outside 70 to 165 characters. C15 says all 75 are too long. Eleven belong to pages deleted in C6, so 75 cannot remain the correct edit count after phase 2. Google also states that meta descriptions have no fixed maximum and are truncated to device width when used.
- **Rationale:** The count must be regenerated from the post-C6 route set. Length alone does not prove that a description is useful or unique.
- **Impact:** Developers can edit deleted content, miss new dynamic descriptions, or fail a build on harmless copy.
- **Recommended action:** Re-crawl after C6. Make missing, duplicated or obviously broken descriptions errors. Use 70 to 165 as an editorial target with approved exceptions. Test final rendered metadata, including API fallbacks.
- **Open questions:** Are dynamic event descriptions in scope? Are social descriptions subject to the same target?
- **Priority:** P2
- **Type:** Confirmed issue, metadata, scope

### F12. National “near me” volume is treated as addressable local demand

- **Relevant section:** Keyword plan and implementation spec C5.
- **Description:** UK-wide volumes of 500,000 and 50,000 are used to justify metadata-only retargets for one pub. Those searches occur across the whole country and are heavily shaped by the searcher's location and the local pack.
- **Rationale:** A business in Stanwell Moor can address only a small geographic share. The documents themselves say Google Business Profile is important but provide no GBP work or local SERP evidence.
- **Impact:** Expected opportunity is overstated, and removing the Heathrow qualifier could reduce existing qualified traffic.
- **Recommended action:** Validate these changes with GSC query data, local rank checks from the catchment, GBP performance and current organic SERPs. Roll out one page first. Preserve proven Heathrow relevance in headings or description until the test shows the broader title performs better.
- **Open questions:** What is the actual drive-time catchment? What are current clicks and bookings from “near me” versus Heathrow-qualified queries?
- **Priority:** P1
- **Type:** Confirmed issue, market sizing, SEO assumption

### F13. The measurement plan is incomplete and contradicts the owner-action list

- **Relevant section:** Keyword plan “Measurement plan”; implementation spec “Remaining owner action” and rollback.
- **Description:** The keyword plan requires baselines for Halloween, parking, food, roast, hotel and private-hire pages. The implementation spec says only hotel and event baselines remain. Neither defines conversion, booking or revenue baselines, success thresholds, guardrails or a clear rollback decision.
- **Rationale:** Impressions can rise while qualified visits or bookings fall. An eight-week review without thresholds cannot answer whether a change worked.
- **Impact:** The team cannot prove value, detect business harm or make a consistent keep/revert decision.
- **Recommended action:** Create one baseline sheet before the next deploy. Include page/query clicks, impressions, CTR, position, organic landing sessions, booking starts, completed bookings, parking revenue and phone/WhatsApp actions. Define 28-, 56- and 84-day reviews and decision thresholds. Use historical pre-change data for changes already committed.
- **Open questions:** Which analytics events are reliable today? Who owns the review and who can approve rollback?
- **Priority:** P0
- **Type:** Confirmed issue, monitoring, delivery

### F14. The URL migration runbook is incomplete

- **Relevant section:** Implementation spec C6, C11, deployment gates and rollback.
- **Description:** The spec adds 301s and removes routes but does not state redirect retention, internal-link cleanup, backlink review, cache/CDN checks or an owner for Search Console actions. The statement that reverting after one week makes pages “start from scratch” is too definite; Google gives no fixed one-week rule.
- **Rationale:** Google recommends keeping permanent redirects for at least a year, updating internal links and monitoring both old and new URLs.
- **Impact:** Redirects may be removed too early, migrations may be judged too soon, and external actions may not happen.
- **Recommended action:** Add a migration checklist: approved map, GSC/backlink baseline, internal-link update, sitemap removal, exact production redirect test, CDN check, monitoring and at least one-year retention. Treat git revert as only the code part of rollback.
- **Open questions:** Who has Search Console and CDN access? Are any paid campaigns, QR codes or social posts using the old URLs?
- **Priority:** P1
- **Type:** Confirmed issue, migration, operations

### F15. Transient management API failures are not safely defined

- **Relevant section:** C9 to C13; event metadata, event page and sitemap flows.
- **Description:** The specification changes dynamic event metadata and sitemap policy without defining dependency errors. In the current route, a general event API error can lead to a permanent redirect to `/whats-on`. In the sitemap flow, an API failure can remove all events from a regenerated sitemap.
- **Rationale:** A timeout is not the same as a missing or retired event. A permanent redirect is the wrong response to a temporary dependency outage.
- **Impact:** A brief API problem can produce durable caching or indexing signals that say a valid event has moved permanently.
- **Recommended action:** Distinguish API `404` from timeout/`5xx`. Use `notFound()` only for confirmed absence, a temporary error response or cached stale data for outages, and a permanent redirect only for an explicit retirement manifest. Preserve the last good event sitemap on refresh failure.
- **Open questions:** What errors does `anchorAPI.getEvent()` expose today? What stale-cache option is available on Vercel/Next.js 14?
- **Priority:** P0
- **Type:** Confirmed issue, integration, error handling

### F16. Seasonal and themed-page lifecycle requirements are missing

- **Relevant section:** C1 and C13; keyword plan Halloween and themed quiz guidance.
- **Description:** The pages are specified for known 2026 dates, but there is no behaviour for sold out, cancelled, postponed, past, no next date, or the annual 2027 rollover. The Halloween page and its dated event page can also target similar queries without a defined relationship.
- **Rationale:** Seasonal pages become inaccurate quickly and are most likely to be visited when the date is close.
- **Impact:** Users may be invited to book a past or unavailable event. Search engines may see two pages competing for the same intent.
- **Recommended action:** Define the evergreen page as the stable acquisition URL and the dated event page as the booking/detail URL. Set distinct titles, canonicals and cross-links. Define post-event copy, cancellation/sold-out states, rollover owner and deadline. Hide unconfirmed sections rather than showing fallback claims.
- **Open questions:** Which page should rank for “Halloween party near me”? Is the event family-friendly, and until what time? What happens when there is no next themed quiz?
- **Priority:** P1
- **Type:** Confirmed issue, user journey, content lifecycle

### F17. The parking comparison has no data contract or freshness policy

- **Relevant section:** C17 and keyword plan parking guidance.
- **Description:** The page must use “live data”, but the spec does not name a source, comparison date, stay length, booking lead time, terminal, product tier, fees, transfer costs or refresh cadence. It also does not define an unavailable or stale state.
- **Rationale:** Airport parking prices are dynamic. Comparisons are misleading unless products are compared on the same dates and conditions.
- **Impact:** Customers can see inaccurate savings claims. The page may create legal, trust and support risk.
- **Recommended action:** Define a comparison schema and owner: source URL/API, sample trip dates, retrieval timestamp, included fees, cancellation terms, transfer assumptions and expiry. Show “checked on” dates. On failure, remove competitor numbers and link to official live prices. Do not scrape or call an external service until terms, rate limits and caching are approved.
- **Open questions:** Is the comparison manual editorial data or an integration? Who verifies competitor prices, and how often?
- **Priority:** P0
- **Type:** Confirmed issue, data, integration, legal risk

### F18. Structured-data goals mix semantic correctness with unsupported rich results

- **Relevant section:** Growth spec schema gaps; C1, C7 to C9, C16 and C22.
- **Description:** The spec treats missing FAQ markup as a broad opportunity, even though a local pub is not normally eligible for FAQ rich results. It keeps many Event objects on `/whats-on`, although Google's event experience supports single-event pages. “Add BreadcrumbList centrally” does not define labels, visible breadcrumb parity, canonical URLs or route coverage.
- **Rationale:** Valid schema is not automatically useful schema. Structured data must represent visible page content and the supported result type.
- **Impact:** Delivery time is spent on markup with no visible benefit, while incorrect or duplicated markup remains possible.
- **Recommended action:** Prioritise accurate Event markup on each event leaf page and accurate LocalBusiness/Menu/Service data. Keep FAQs for users, with schema optional. Remove per-event Event markup from multi-event listings unless a documented search benefit remains. Define breadcrumb trails per route family and validate visible and JSON-LD trails together.
- **Open questions:** Is there evidence that FAQ or HowTo markup produces any current search appearance? Which pages need a visible breadcrumb added, not just JSON-LD?
- **Priority:** P1
- **Type:** Confirmed issue, structured data, simplification

### F19. Merging JSON-LD blocks does not solve the stated performance problem

- **Relevant section:** C22 and growth spec P3 housekeeping.
- **Description:** The proposed fix for 70KB of JSON-LD is to wrap it in one `@graph`. This removes script-tag overhead but keeps nearly all entity data, so it will not materially reduce the 491KB HTML response.
- **Rationale:** The payload size comes from the repeated event objects, not mainly from the number of `<script>` tags.
- **Impact:** The task can be marked complete while HTML size, parse work and crawl waste stay almost unchanged.
- **Recommended action:** Set an HTML and JSON-LD byte budget. Remove listing-page Event objects that are not useful, reduce the number of server-rendered events, or paginate. Measure compressed and uncompressed HTML before and after. Keep one graph only if it also improves maintainability.
- **Open questions:** How much of the 491KB is event cards, JSON-LD and other data? What is the target size?
- **Priority:** P1
- **Type:** Confirmed issue, performance, impractical solution

### F20. Accessibility has no acceptance criteria

- **Relevant section:** All new and changed pages/components, especially C1, C13, C14, C17 and C18.
- **Description:** The specification does not require keyboard use, focus visibility, semantic heading order, link purpose, accordion state, contrast, reduced motion, image alternatives or mobile zoom/reflow checks.
- **Rationale:** Reusing components lowers risk but does not prove the composed pages meet WCAG 2.2 AA or work with assistive technology.
- **Impact:** New acquisition pages and link modules may introduce barriers or regressions that the listed test pipeline will not detect.
- **Recommended action:** Add automated axe checks for changed templates, keyboard tests for FAQ and link modules, and manual checks at 320px width and 200% zoom. Require descriptive link text and meaningful image alt text.
- **Open questions:** Is WCAG 2.2 AA the project standard? Which browser and screen-reader combinations are supported?
- **Priority:** P1
- **Type:** Confirmed issue, accessibility, testing

### F21. CMS content in JSON-LD needs an explicit security rule

- **Relevant section:** C12, C16 and C22; event and FAQ structured data.
- **Description:** Event names, descriptions and FAQs can come from the management database and are inserted into JSON-LD scripts. The specification does not require safe serialization or URL validation.
- **Rationale:** Plain `JSON.stringify` inside `dangerouslySetInnerHTML` can be broken by strings containing `<` or a closing script sequence. The repository already has `jsonLdSafeStringify` for this reason.
- **Impact:** A compromised or malformed CMS value could break the page or create a script-injection path.
- **Recommended action:** Require `jsonLdSafeStringify` for every JSON-LD block, including graphs. Validate URLs and schema fields from the API. Never expose API keys or fetch arbitrary source URLs from CMS input.
- **Open questions:** Which structured-data components still use raw `JSON.stringify`? Are management inputs trusted HTML, plain text or Markdown?
- **Priority:** P1
- **Type:** Confirmed issue, security, data validation

### F22. The test and deployment gate is incomplete, and the current branch fails it

- **Relevant section:** “Deployment order and verification gates”.
- **Description:** The pipeline covers lint, TypeScript, Jest and build, but not a production-mode crawl, browser journeys, accessibility, visual regression, schema validation or dependency failures. On the current branch, Jest passes 1,721 tests and TypeScript passes, but `npm run lint` fails on four disallowed content-width caps in `app/quiz-night/themed/page.tsx`.
- **Rationale:** The specification says every phase must pass the full gate. The branch is therefore not currently deployable under its own rule.
- **Impact:** A phase can pass unit tests while shipping wrong metadata, redirects, layout, structured data or degraded journeys. The themed hub is presently blocked by a repository audit.
- **Recommended action:** Fix or explicitly approve the width exceptions. Add a production build crawl that checks status, canonical, robots, title, description, headings, schema, internal links and redirect destinations. Add focused Playwright smoke tests for booking CTAs and retired URLs.
- **Open questions:** Is a preview deployment available for crawl and visual checks? Who signs off manual QA?
- **Priority:** P0 for current readiness; P1 for the missing test scope
- **Type:** Confirmed issue, delivery, testing

### F23. The evidence is not reproducible from the repository

- **Relevant section:** Method statements in all three documents; G1, G4, G6 and G7.
- **Description:** The documents cite a 226-URL crawl, 5-gram analysis, 684 redirect rules, 90 GKP terms and GSC findings, but the exact raw exports, normalization rules, scripts, crawl timestamp and expected outputs are not linked from this specification set.
- **Rationale:** Counts change as the site changes. A developer cannot reproduce a threshold such as “overlap below 30%” without the same corpus and algorithm.
- **Impact:** Acceptance becomes subjective and later audits cannot explain different numbers.
- **Recommended action:** Store or link the crawl inventory, redirect expectation map, GKP export and GSC export with dates. Version the scripts and document tokenization, boilerplate removal, page rendering and link-count rules.
- **Open questions:** Where are the original crawl and GKP export files? Does overlap include navigation, footer and repeated components?
- **Priority:** P1
- **Type:** Confirmed issue, evidence, testing

### F24. The internal-link requirement is not defined or achievable as written

- **Relevant section:** Growth spec internal links; C14 and G4.
- **Description:** “At least three inbound links” does not say whether header, footer, sitemap page, archive pagination or repeated site-wide modules count. The listed C14 work does not cover every dynamic event, yet G4 applies to every sitemap page. The related-post algorithm is also undefined for noindex, redirected, expired or low-tag-overlap posts.
- **Rationale:** Link count alone can encourage irrelevant site-wide blocks. Google asks for useful, crawlable contextual links, not a universal number of three.
- **Impact:** The gate may be impossible or satisfied with low-quality links that hurt user experience.
- **Recommended action:** Count only unique canonical pages with crawlable `<a href>` links. Report contextual and navigation links separately. Exclude utility/noindex pages. Define related-post eligibility, tie-breaks, fallbacks and maximum links. Use a relevance review as well as a count.
- **Open questions:** Are event pages expected to receive three unique links? Should past events be excluded from the rule?
- **Priority:** P1
- **Type:** Confirmed issue, functional detail, SEO

### F25. External factual claims have no source or review owner

- **Relevant section:** C1, C6, C13, C17, C18 and C19.
- **Description:** The work adds drive times, airline lists, terminal routes, taxi fares, hotel details, charity relationships, service timings and venue parking facts. The spec often says “real” or “confirm”, but does not name a source, date or approver.
- **Rationale:** These facts change. Some are safety, accessibility, pricing or charity claims and need stronger control than normal marketing copy.
- **Impact:** Incorrect details can cause missed flights, complaints, reputational harm or false partner claims.
- **Recommended action:** Add a source-and-review table for every changeable claim. Use official airport/vendor sources where possible, date every price and route check, and require owner approval for event, charity and family-access claims. Define a recheck cadence.
- **Open questions:** Who approves local drive times and funeral-venue details? Are airline lists worth maintaining at all?
- **Priority:** P1
- **Type:** Confirmed issue, content governance, data quality

### F26. C7 to C9 do not carry every schema fix from the GSC audit

- **Relevant section:** Growth spec schema gaps; implementation spec C7 to C9; companion GSC audit.
- **Description:** The implementation spec covers fish and chips, parking, World Cup and sitemap `lastmod`. The companion GSC audit also requires a decision on Easter and Mother's Day event `offers`: add truthful price/currency data when a fixed paid package exists, otherwise remove the offer. Those pages are missing from the change register.
- **Rationale:** The implementation spec says the GSC fixes are carried over, but the set is incomplete.
- **Impact:** Known structured-data warnings and possibly misleading offers can remain after the phase is declared complete.
- **Recommended action:** Add explicit C items for Easter and Mother's Day, or record a reasoned “no change” decision for each. Test the final event lifecycle and offer state.
- **Open questions:** Do these meals have fixed packages or only normal menu pricing? Are their event schemas still appropriate after the date passes?
- **Priority:** P1
- **Type:** Confirmed issue, scope gap, structured data

### F27. Sitemap acceptance checks only one kind of bad `lastmod`

- **Relevant section:** C9 and G2.
- **Description:** C9 correctly removes future event dates, but G2 only checks that no date is in the future. Google also requires `lastmod` to reflect a real significant update. The current sitemap code uses hard-coded batch dates and can substitute the current time for invalid values in other route families.
- **Rationale:** “Not future” does not mean accurate.
- **Impact:** The sitemap may continue to send false freshness signals and Google may ignore `lastmod` site-wide.
- **Recommended action:** Omit `lastModified` when the source date is missing or invalid. Keep a real content-updated field for dynamic records. Test invalid, missing, future and unchanged dates. Do not use deploy date or request time as a content date.
- **Open questions:** Which static routes have a trustworthy content-update source? Should hard-coded batch dates be replaced by file or CMS metadata?
- **Priority:** P1
- **Type:** Confirmed issue, sitemap, data integrity

## Optional improvements

### O01. Use one delivery manifest for every URL change

- **Relevant section:** C6, C11, C20, C21 and C23.
- **Description:** Store source, destination, reason, approval date, baseline link and retention date in one typed file. Generate redirect config, retirement sets and tests from it.
- **Rationale:** The current approach duplicates retirement knowledge between redirect JSON, code sets, sitemap logic and prose.
- **Impact:** Fewer drift bugs and easier audits.
- **Recommended action:** Add a small typed manifest and generation/validation test. Keep pattern redirects separately because precedence matters.
- **Open questions:** Should it cover all 696 legacy rules or only new programme changes?
- **Priority:** P2
- **Type:** Optional improvement, simplification, configuration

### O02. Separate URL migrations from on-page SEO changes

- **Relevant section:** Phases 2 and 3.
- **Description:** C6 is deployed with unrelated schema work. C11 is deployed with a new hub, title changes and a UI bug fix.
- **Rationale:** Smaller releases are easier to diagnose and roll back. Google's migration guidance also recommends changing one thing at a time where practical.
- **Impact:** Better measurement and lower rollback risk.
- **Recommended action:** Ship the destination page first, then redirects and sitemap changes, then metadata/content improvements. Keep a short observation window between high-risk steps where the seasonal deadline allows it.
- **Open questions:** Does the early-September Halloween deadline require a separate fast track?
- **Priority:** P2
- **Type:** Optional improvement, delivery

### O03. Replace page counts with generated route inventories

- **Relevant section:** C2, C15, C16 and the totals table.
- **Description:** Hard-coded counts such as 88, 75 and 56 become stale after earlier phases.
- **Rationale:** The repository already has static, dynamic, blog and sitemap sources that can generate the active route inventory.
- **Impact:** Less manual recounting and fewer impossible gates.
- **Recommended action:** Produce an inventory artifact during the production crawl and have acceptance tests consume it.
- **Open questions:** Should preview-only and noindex routes be separate inventories?
- **Priority:** P2
- **Type:** Optional improvement, automation

### O04. Add freshness metadata for volatile content

- **Relevant section:** Halloween, themed quizzes, parking, terminal pages and landmark pages.
- **Description:** Store `verifiedAt`, source and owner for volatile claims, then report overdue checks.
- **Rationale:** These pages depend on facts that change outside the codebase.
- **Impact:** Lower stale-content risk and clearer editorial ownership.
- **Recommended action:** Add a small data structure or content-front-matter convention and a CI warning for expired verification dates.
- **Open questions:** What expiry period is suitable for prices, airport routes and annual events?
- **Priority:** P3
- **Type:** Optional improvement, content operations

### O05. Simplify the low-value SEO work

- **Relevant section:** C3, C15, C16 and C22.
- **Description:** Hard 60-character titles, mandatory 70-to-165 descriptions, broad FAQ schema and JSON-LD graph merging create work without clear business value.
- **Rationale:** The highest-risk issues are redirect correctness, event/API lifecycle, factual accuracy and measurement.
- **Impact:** A smaller programme can ship sooner and with better evidence.
- **Recommended action:** Keep doubled-title fixes, unique useful descriptions and accurate schema. Downgrade exact character limits, FAQ markup and graph consolidation unless measured evidence justifies them.
- **Open questions:** Which tasks are required for a specific Search Console error, and which are only general hygiene?
- **Priority:** P2
- **Type:** Optional improvement, scope simplification

### O06. Add a decision and ownership table

- **Relevant section:** “Decisions, all settled” and “Remaining owner action”.
- **Description:** The documents mix owner approval, developer choices, editorial checks and Search Console work without named owners or due dates.
- **Rationale:** Several tasks cannot be completed in code.
- **Impact:** Manual steps and content approvals are easy to miss.
- **Recommended action:** For every C item, name the developer, content approver, analytics owner, external-system owner, due date and evidence link.
- **Open questions:** Who owns GSC, management database, CDN/Vercel, event copy and ongoing content checks?
- **Priority:** P2
- **Type:** Optional improvement, delivery governance

## Specific wording changes suggested

These are narrow corrections, not a rewrite of the original documents.

1. Replace **“There is no demand”** with:  
   **“Google Keyword Planner returned no reportable volume. Demand may be low or below its reporting threshold; use GSC and conversion data before deleting a page.”**

2. Replace **“competition index 0 means no competitor”** or **“uncontested”** with:  
   **“Google Ads shows little or no advertiser competition. Organic difficulty is unconfirmed until the live SERP is reviewed.”**

3. Replace the implementation status with:  
   **“Status: strategy approved in part. Rebaseline against the current branch and resolve the P0 findings in the developer review before further implementation.”**

4. Replace the C11 general quality-floor wording with:  
   **“For this release, retire only the approved slug manifest. An automatic future quality floor is out of scope until the event-list API exposes reviewed quality fields.”**

5. Replace **“all redirects are healthy”** with:  
   **“All tested sources reached a 200, but intended destination and rule precedence require a separate mapping audit.”**

6. Replace hard title/description limits with:  
   **“Doubled brands, missing metadata and duplicated metadata fail the gate. Length targets are editorial warnings unless a route has an approved hard requirement.”**

## Required changes before approval

1. Publish one authoritative hotel redirect map and remove the conflicting destination text.
2. Replace the redirect test with exact destination and precedence checks.
3. Reframe GKP competition as paid evidence and validate organic SERPs and local demand.
4. Make C11 a fixed reviewed manifest, or define and fund the required management API change.
5. Rebaseline the change register against the current branch and correct phase counts and gates.
6. Define safe API failure behaviour for event pages and sitemap generation.
7. Add a complete measurement plan with business outcomes, thresholds, owners and review dates.
8. Define the parking comparison data source and freshness policy.
9. Add accessibility, JSON-LD safety, production crawl and browser smoke checks.
10. Fix the current themed-quiz width audit failure before treating the branch as deployable.

## Unresolved decisions

- Is event retirement a fixed one-time cleanup or an automatic ongoing rule?
- What exact final HTML title format should events use?
- Should the broad “near me” retargets proceed before local organic SERP validation?
- Which page owns seasonal search intent: the evergreen occasion page or the dated event page?
- What is the approved source and comparison method for competitor parking prices?
- Should `/whats-on` emit any per-event Event schema at all?
- Which route families must have visible and structured breadcrumbs?
- Is `/private-hire/venue-tour` intentionally noindex?
- Who owns GSC, CDN, management API and content-freshness tasks?

## Major risks

- Wrong or generic redirects can lose topical relevance while returning apparently healthy status codes.
- Page removals and retargets can lose qualified traffic because baselines and success thresholds are incomplete.
- Temporary API failures can be mistaken for permanent page removals.
- Volatile price, route, airline, event and charity facts can become false.
- Seasonal dates can pass before the content lifecycle is updated.
- The branch can pass unit tests while failing repository layout rules or rendered-page checks.
- Paid keyword metrics can drive the wrong organic priorities.

## Recommended next steps

1. Stop using the 17 August implementation spec as the live change register.
2. Create a current inventory from `main`, the delivery branch and the working tree.
3. Resolve F01, F02, F05, F06, F07, F13, F15, F17 and F22 first.
4. Build exact redirect, route and metadata crawl artifacts.
5. Fix the themed-quiz lint failure and run lint, TypeScript, Jest, build and a production crawl.
6. Ship the seasonal page only after factual and booking-state sign-off.
7. Stage URL migrations separately, keep redirects for at least one year and review at 28, 56 and 84 days.

