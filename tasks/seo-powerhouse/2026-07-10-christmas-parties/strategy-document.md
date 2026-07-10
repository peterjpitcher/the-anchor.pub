# Christmas Parties Page SEO Strategy

Date: 2026-07-10  
Scope: `/christmas-parties` and its direct enquiry path only

## Direction

The page has one commercial job: turn local Christmas demand into qualified enquiries. It must immediately offer two clear routes:

1. Christmas party enquiry, including buffet, entertainment and private-space needs.
2. Sit-down Christmas lunch or dinner enquiry, explicitly marked as pre-order only.

The current page is technically discoverable and well linked: it returns 200, is indexable, self-canonical, included in the sitemap and has 30 sampled inbound internal links. The main constraint is not crawl discovery. It is mixed intent and an enquiry flow that only offers “Dinner (up to 25)” or “Buffet (26+)”, with evening-only times. That does not support the lunch journey requested by the business and it turns party format into a guest-count rule.

The page also carries conflicting commercial facts. Live metadata and copy say 10–150 guests while the SSOT gives Christmas capacity as 60 seated and 200 standing. Event JSON-LD contains hardcoded prices even though the SSOT says Christmas pricing must come from the live approved source. These mismatches should be corrected before adding more copy.

## Where this page can win

The realistic opportunity is high-intent local demand around Heathrow, Staines and Stanwell Moor. Manual SERP review shows two distinct result patterns:

- party venue searches reward clear packages, capacities, inclusions and enquiry routes;
- festive meal searches reward menu, deposit, pre-order and lunch/dinner booking terms.

The Anchor can differentiate with a proper pub setting, free on-site parking, proximity to Heathrow and a single page that makes both journeys unambiguous. It should not try to out-rank national directories for broad venue-discovery terms by adding more generic text. Demand, ranking and traffic data are unavailable, so exact term selection remains blocked on GSC and Keyword Planner validation.

## Priority order

1. **Fix the conversion journey.** Separate “Christmas party” from “sit-down lunch or dinner”, add lunch service/times, and preserve journey/source in the enquiry payload and analytics.
2. **Make the promise accurate.** Put “pre-order only” beside the meal option, reconcile Christmas capacities and deposits with the SSOT, shorten the search title, and remove hardcoded prices from any schema that does not match current visible pricing.
3. **Make outcomes measurable.** Verify the correct GSC property and GA4/GTM key events before judging the work.
4. **Tighten rather than expand.** Keep the main page focused on choosing an offer and enquiring. Schedule evidence-led removal of repetitive, search-engine-first FAQ and copy only after a content diff and rollback copy exist.

## Proposed success measures

- 100% of successful Christmas enquiries record journey (`party` or `meal`), service (`lunch`, `dinner` or party format), CTA source and party size.
- 100% of meal enquiry entry points show “pre-order only” before submission.
- GA4 records form open, successful form completion, phone click and email click as distinct actions; successful enquiry is configured and verified as the primary key event.
- GSC query/page data is available for the exact URL, enabling party-versus-meal cluster reporting.
- Proposed commercial test target: at least 15% improvement in qualified enquiry completion rate against a like-for-like pre-change baseline after enough traffic has accrued. This is a target, not a claim about current performance.

## Specialist review scope

- **Technical:** schema-to-visible-content parity, final title/canonical/indexability, render and form/API integrity.
- **Content:** two-intent hierarchy, SSOT facts, pre-order clarity, repetition and unsupported claims.
- **Analytics:** verify actual GA4/GTM delivery and key-event status, not just helper calls in code.
- **UX/CRO:** party-versus-meal choice, lunch availability, mobile form completion and confirmation state.
- **Editorial:** retain useful local proof while removing keyword-stuffed or duplicative sections after approval.

## Unified backlog

| ID | Category | Item | Expected impact | Effort | Tier | Dependencies | Decision |
|---|---|---|---|---|---|---|---|
| SEO-001 | UX | Split party and pre-order meal enquiry journeys | High, removes a direct booking-path mismatch | Medium | Immediate | Developer, enquiry recipient | Do now |
| SEO-002 | Content | Align hero, metadata and booking facts to the two offers and SSOT | High, improves relevance and trust | Small | Immediate | Content, SSOT | Do now |
| SEO-003 | Analytics | Verify GA4/GTM actions and primary enquiry key event | High, roadmap is otherwise unmeasurable | Small | Immediate | Analytics/GTM access | Do now |
| SEO-004 | Analytics | Verify the correct GSC property and import URL/query data | High, organic outcomes are otherwise unmeasurable | Small | Immediate | GSC access | Do now |
| SEO-005 | Technical | Reconcile Event/offers JSON-LD with visible, approved facts | High, removes price and entity mismatch | Medium | Immediate | Developer, approved schema decision | Do now |
| SEO-006 | Content | Remove repetitive SEO-first FAQ/copy after evidence-led editorial pass | Medium, sharpens intent and conversion focus | Medium | Short-term | Content approval, baseline | Schedule |
| SEO-007 | Content | Keep support pages differentiated and strengthen contextual links | Medium, clarifies topic ownership | Small | Short-term | GSC query evidence | Schedule |
| SEO-008 | Technical | Obtain mobile CWV field/lab evidence | Medium if performance is poor; currently unknown | Small | Short-term | PSI API key or browser run | Monitor |

### SEO-001: Split the enquiry journeys

- **Problem:** The UI and API model only `dinner` versus `buffet`; lunch is unavailable and party format is tied to a 26-guest threshold.
- **Implementation:** Use customer-facing routes “Christmas party” and “Sit-down Christmas lunch or dinner”. For meals, require lunch/dinner service and show suitable times. For parties, collect format/preferences without forcing buffet solely by party size. Send these fields in email and analytics.
- **Acceptance:** Both journeys can be completed on mobile and desktop; email subject/body identify the journey and service; lunch times are selectable; pre-order-only wording is visible before submit.
- **Validation:** Submit test enquiries for party, lunch and dinner; inspect request payload, recipient email and analytics debug events.
- **Risk/rollback:** Recipient workflows may depend on old mode names. Preserve backward-compatible API mapping or revert the form/API commit.

### SEO-002: Align front-of-page copy and facts

- **Problem:** The 79-character live title is long, the page leads with several competing phrases, and capacity claims mix private-hire and Christmas limits.
- **Implementation:** Lead with the venue and two booking choices; put “pre-order only” beside lunch/dinner; use the SSOT’s Christmas capacity and deposit language; shorten the title while retaining Heathrow/Staines relevance.
- **Acceptance:** One H1, two clear primary choices above the fold, no conflicting Christmas capacity/deposit claims, and a materially shorter rendered title.
- **Validation:** Re-crawl metadata/headings and compare all capacity/deposit text with `docs/SSOT.md`.
- **Risk/rollback:** Search snippet wording may change. Keep the prior metadata strings for one-commit rollback.

### SEO-003: Verify analytics delivery

- **Problem:** Code calls tracking helpers, but no GA4 property report, DebugView evidence or key-event configuration was available.
- **Implementation:** Verify form open, successful submit, phone and email events in browser/GTM preview and GA4 DebugView. Include journey, service and CTA source; mark only successful submission as the primary lead key event.
- **Acceptance:** Each action fires once with non-PII parameters and is visible in the correct GA4 property.
- **Validation:** Save a dated event test matrix and GA4/GTM screenshots/export.
- **Risk/rollback:** Duplicate tags can inflate events. Disable the new tag/version if duplicates appear.

### SEO-004: Restore search-side measurement

- **Problem:** No accessible GSC property/export was supplied, so demand, clicks, positions, CTR gaps and cannibalisation cannot be verified.
- **Implementation:** Verify the correct domain property, then import page/query data for `/christmas-parties` and related Christmas URLs.
- **Acceptance:** The page and query export contains date, page, query, impressions, clicks, CTR and position for an agreed period.
- **Validation:** Reconcile export totals with the GSC UI and save the evidence file in this workspace.
- **Risk/rollback:** Read-only measurement change; no site rollback needed.

### SEO-005: Reconcile structured data

- **Problem:** `Event` JSON-LD describes a seasonal service window and hardcodes offer prices that conflict with the live-pricing rule.
- **Implementation:** Decide whether a real scheduled event exists. If not, remove the Event/offers block and retain only schema that accurately describes the venue, page and breadcrumbs. If a real event exists, generate it from approved event data and ensure all visible facts match.
- **Acceptance:** No unapproved hardcoded Christmas price remains; every schema claim is visible and current; offline validator has no required-field error for retained eligible types.
- **Validation:** Inspect rendered JSON-LD, rerun schema validation and test the live URL after deployment.
- **Risk/rollback:** Rich-result eligibility may change. Save the old block and revert if Search Console reports a valid regression.

### SEO-006: Tighten the page

- **Problem:** The page contains 4,569 words, 20 FAQ-like questions and obvious search-engine-first wording, which dilutes the booking choice.
- **Implementation:** Produce a section-level keep/merge/remove diff. Keep offer, menu, terms, location proof, capacity and enquiry content; merge repetitive corporate/idea sections; remove the “xmas party near me” FAQ and unsupported repetition only after approval.
- **Acceptance:** No loss of unique approved facts or internal links; main conversion choices remain prominent; removed copy has a rollback record.
- **Validation:** Compare crawl headings/word count, run a visual regression, and monitor page/query data after GSC becomes available.
- **Risk/rollback:** The page already appears for a relevant venue query in manual search, so pruning may affect visibility. Roll back from the saved content diff if query coverage declines materially.

### SEO-007: Define topic ownership

- **Problem:** The main page links to corporate and budget Christmas pages, but GSC evidence is unavailable to rule out query overlap.
- **Implementation:** Keep `/christmas-parties` as the primary commercial hub; use `/corporate-christmas-parties` for organiser-specific detail and the budget article for planning advice. Add descriptive two-way contextual links after query ownership is checked.
- **Acceptance:** Each URL has a distinct primary intent and reciprocal, descriptive links without duplicated title/H1 targeting.
- **Validation:** Crawl links/headings and review GSC query overlap once available.
- **Risk/rollback:** Over-optimised anchors can blur intent. Revert anchors if overlap increases.

## Cadence

- Before release: validate facts, enquiry flows, analytics events and rendered metadata/schema.
- Weekly during the 2026 booking window: review qualified enquiries by journey, failed submissions, CTA sources and availability feedback.
- Monthly: review GSC page/query trends and GA4 conversion rate, then change one major content or UX variable at a time.
- After the season: record lead quality, booking value and journey performance to set the 2027 baseline.

```json
{"findings":[{"finding":"The page's direct enquiry path models only dinner versus buffet, offers evening-only times and cannot explicitly capture a pre-order Christmas lunch journey.","evidence":"app/christmas-parties/client-components.tsx:1381-1394,1547-1603; app/api/enquiry/christmas/route.ts:9-49","source":"Manual code inspection","dataStatus":"Known","severity":"Critical","confidence":"High","impactArea":"conversion","owner":"UX","effort":"Medium","dependencies":"Developer and enquiry recipient","fixType":"Template/system fix","recommendedAction":"Split the form into Christmas party and sit-down lunch/dinner journeys; capture meal service, party format, source and suitable time options end to end.","validationStep":"Submit party, lunch and dinner test enquiries and verify payload, recipient email and analytics parameters.","riskRollback":"Preserve backward-compatible mode mapping and revert the form/API commit if downstream handling fails."},{"finding":"GA4/GTM conversion delivery and key-event status cannot be verified from the supplied evidence.","evidence":"No GA4 export, GTM preview record or DebugView evidence exists in tasks/seo-powerhouse/2026-07-10-christmas-parties; code calls tracking helpers but property delivery is unconfirmed.","source":"Workspace evidence review and manual code inspection","dataStatus":"unavailable","severity":"High","confidence":"High","impactArea":"conversion","owner":"Analytics","effort":"Small","dependencies":"GA4/GTM access","fixType":"Analytics/governance fix","recommendedAction":"Verify form open, successful submit, phone and email events in GTM preview and GA4 DebugView; configure successful enquiry as the primary key event.","validationStep":"Save a dated event test matrix showing one non-PII event per action in the correct property.","riskRollback":"Disable the new tag/version if duplicate events are observed."},{"finding":"Accessible GSC page and query data is unavailable, blocking demand, CTR, position and cannibalisation analysis.","evidence":"inputs/input-summary.md records GSC Performance and Indexing exports as unavailable.","source":"SEO Powerhouse input summary","dataStatus":"unavailable","severity":"High","confidence":"High","impactArea":"SEO","owner":"Analytics","effort":"Small","dependencies":"GSC property access","fixType":"Analytics/governance fix","recommendedAction":"Verify the correct domain property and import page/query data for the Christmas page and related URLs.","validationStep":"Reconcile an exported page/query dataset with GSC UI totals for the same dates.","riskRollback":"Read-only measurement change; no site rollback required."},{"finding":"Christmas commercial facts are inconsistent between visible metadata/copy, JSON-LD and the canonical SSOT.","evidence":"Live metadata says 10+ to 150 guests (evidence/page-metadata.csv); Event JSON-LD hardcodes multiple prices (app/christmas-parties/page.tsx:31-169); SSOT gives Christmas capacity 60 seated/200 standing and requires live-source pricing (docs/SSOT.md:195,222-223; SSOT.json:857-865).","source":"collect-site-evidence.py and manual SSOT/code inspection","dataStatus":"Known","severity":"High","confidence":"High","impactArea":"revenue","owner":"Technical","effort":"Medium","dependencies":"Developer and approved schema decision","fixType":"One-off page fix","recommendedAction":"Reconcile visible facts to the SSOT and remove or regenerate schema claims that are not current and visible.","validationStep":"Re-crawl the page, inspect rendered JSON-LD and compare every capacity, deposit and price claim with approved sources.","riskRollback":"Store the old metadata/schema block and revert if a verified search regression occurs."}]}
```
