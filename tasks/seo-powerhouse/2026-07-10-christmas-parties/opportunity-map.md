# Page-Level Opportunity Map

Date: 2026-07-10

## Highest-value opportunities

| Opportunity | Evidence | Commercial value | Achievability | Decision |
|---|---|---|---|---|
| Split party and pre-order meal journeys | Current form only supports dinner/buffet and no lunch times | High, directly affects qualified enquiry completion | High, contained to page/form/API | Do now |
| Replace the overloaded H1/title with a clear venue proposition | Live title is 79 characters; H1 lists party, dinners, party nights and lunch | High, improves search snippet clarity and first-screen comprehension | High | Do now |
| Put a concise “choose your Christmas” answer block above the long detail | Page has 4,569 words and 15 major sections before the final enquiry area | High, reduces decision effort | High | Do now |
| Reconcile Christmas capacity, deposit and pricing claims | Live copy/schema and SSOT differ | High, protects trust and lead quality | High for copy; medium for schema | Do now |
| Prune repetitive FAQ and SEO-first copy | Twenty FAQ-like headings include “Can I find you by searching ‘xmas party near me’?” | Medium, sharpens topic focus | Medium; page already has observable search visibility | Schedule |
| Clarify support-page ownership | Corporate and budget pages receive only 2 and 1 sampled inbound links respectively | Medium, improves cluster clarity | Medium; GSC overlap unknown | Schedule |
| Establish CWV evidence | CrUX/PSI data is unavailable | Unknown until measured | High to collect with API/browser access | Monitor |

## Content and structure

Recommended page order:

1. Clear H1 and one-sentence location/value proposition.
2. Two option cards: “Plan a Christmas party” and “Book a pre-order Christmas lunch or dinner”.
3. Essential facts: capacity, deposit, pre-order deadline, parking and location.
4. Current menu/pricing route and party-format details.
5. Spaces and organiser proof.
6. Short, useful FAQ.
7. Final enquiry choice.

This is a hierarchy change, not a request for more copy. The existing page already has enough topical coverage.

## Internal-link and cannibalisation view

- The main page is not orphaned and has 30 sampled inbound links, so broad sitewide link acquisition is not the immediate issue.
- `/corporate-christmas-parties` and `/blog/cheap-christmas-parties-heathrow` are already linked from the main page but receive only 2 and 1 sampled inbound links. Add reciprocal contextual links only after their intent is kept distinct.
- Cannibalisation cannot be confirmed without GSC page/query data. Treat it as a measurement gap, not a fact.
- Do not create more Christmas location pages until the current three URLs have distinct query ownership.

## Rich-result and schema opportunity

The page already exposes Event, FAQPage, BreadcrumbList and venue-related types. More schema is not the opportunity. Accuracy is. FAQ rich results are retired for most non-government/non-health sites, and the Event block hardcodes unapproved prices for what appears to be a seasonal service window. Retain Breadcrumb and accurate venue/page identity; use Event only for a real, scheduled event with visible, approved details.

## AI answer-engine visibility

Potential is **directional, confidence Low** because no AI-referral or citation data is available. The page has strong entity ingredients: a named venue, precise location, contact details, capacity, parking and booking rules. It could become more citation-friendly with one short, factual block answering:

- What can I book?
- Is Christmas lunch/dinner pre-order only?
- What deposit applies?
- How many guests can you host at Christmas?
- How far is the venue from Heathrow and Staines?

Every answer must match visible content and schema. Do not chase AI citations with extra generic FAQs; source-worthy, stable facts are more useful.

## What not to do

- Do not expand the page beyond its current 4,569 words.
- Do not publish new exact-match location pages without demand and cannibalisation evidence.
- Do not hardcode prices in copy or schema when the approved source is live.
- Do not treat FAQ schema as a likely rich-result win.

```json
{"findings":[{"finding":"The live title and H1 combine too many offers, weakening the primary venue proposition and the distinction between party and meal intent.","evidence":"evidence/page-metadata.csv: rendered title length 79 and H1 'Christmas party near Heathrow, pub dinners, party nights & festive lunch 2026'.","source":"collect-site-evidence.py","dataStatus":"Known","severity":"Medium","confidence":"High","impactArea":"SEO","owner":"Content","effort":"Small","dependencies":"Content approval","fixType":"One-off page fix","recommendedAction":"Use one concise local venue proposition in the title/H1 and present party versus pre-order lunch/dinner as the two immediate choices.","validationStep":"Re-crawl and confirm one H1, a shorter rendered title and two visible first-screen choices.","riskRollback":"Revert metadata/H1 strings if a verified search regression occurs."},{"finding":"The page is heavily linked and already content-rich, so adding more generic Christmas copy is lower value than improving hierarchy and conversion clarity.","evidence":"evidence/internal-link-summary.csv shows 30 inbound links; evidence/page-metadata.csv shows 4,569 words, 15 H2-level sections and 36 H3-level headings.","source":"collect-site-evidence.py and analyze-internal-links.py","dataStatus":"Known","severity":"Medium","confidence":"High","impactArea":"UX","owner":"Editorial","effort":"Medium","dependencies":"Content approval and GSC baseline","fixType":"Content process fix","recommendedAction":"Reorder around the two booking choices and prepare an evidence-led keep/merge/remove diff instead of adding copy.","validationStep":"Compare section order, word count and conversion visibility before and after; monitor GSC once available.","riskRollback":"Store removed sections in a rollback document and restore if query coverage materially declines."},{"finding":"A concise, source-aligned booking-facts block is a directional AI-citation and conversion opportunity.","evidence":"The page contains stable venue/location facts and booking rules across docs/SSOT.md:195,222-223 and page content, but they are dispersed and some claims conflict.","source":"Manual content and SSOT inspection","dataStatus":"inferred","severity":"Low","confidence":"Low","impactArea":"AI visibility","owner":"Content","effort":"Small","dependencies":"SSOT reconciliation","fixType":"One-off page fix","recommendedAction":"Add a concise visible block covering offers, pre-order rule, deposit, Christmas capacity, parking and location, with matching schema.","validationStep":"Verify every statement against the SSOT and inspect rendered content/schema parity.","riskRollback":"Remove the block if it duplicates content or obscures the primary CTAs."}]}
```
