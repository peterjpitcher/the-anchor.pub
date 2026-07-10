# SEO Quick Checkup — Christmas Parties

**Date:** 10 July 2026  
**Target:** `/christmas-parties`  
**Concern:** Generate Christmas party enquiries and pre-order sit-down Christmas lunch or dinner enquiries.  
**Data sources used:** Live-page evidence crawl, local code and rendered-page checks, SSOT, manual SERP review, public GTM/GA4 inspection and specialist reviews. Google Search Console exports, GA4 account reports and page-level Core Web Vitals were unavailable.

## Diagnosis

The page previously mixed party and meal intent, did not support Christmas lunch, and contained conflicting or unsupported details. The implementation now gives visitors separate party, lunch and dinner paths, clearly states that sit-down meals are pre-order only, replaces the stale priced Event schema and removes unverified testimonials. Search and conversion uplift cannot be quantified until GSC and GA4 data are available.

## Top Issues

### 1. Christmas funnel events do not reach GA4

**What:** The page emits useful party, meal, service, format and source events, but the public GTM container has no custom-event mapping for them.  
**Why it matters:** Successful enquiries cannot be measured reliably in GA4.  
**Fix:** Map the events in GTM and mark the successful enquiry as `generate_lead`.  
**Effort:** Moderate, blocked on GTM and GA4 access.

### 2. Marketing tags load before consent

**What:** Clarity, LinkedIn and Meta were observed loading and setting cookies before consent.  
**Why it matters:** This creates a privacy and measurement-quality risk.  
**Fix:** Apply consent requirements to those tags and verify in a fresh browser session.  
**Effort:** Moderate, blocked on GTM and privacy-owner access.

### 3. No first-party search or field-performance baseline

**What:** GSC page/query data and page-level Core Web Vitals were unavailable.  
**Why it matters:** Demand, cannibalisation, CTR and performance impact cannot be measured with confidence.  
**Fix:** Import the canonical-domain GSC data and collect mobile field or lab performance evidence after release.  
**Effort:** Quick measurement task, access required.

## Quick Wins Completed Locally

| Change | Before | Now | Impact |
|---|---|---|---|
| Booking journeys | Dinner or buffet framing | Party, Christmas lunch and Christmas dinner | Matches the three commercial needs |
| Meal condition | Easy to miss | Pre-order-only wording in page and forms | Better-qualified meal enquiries |
| Metadata and H1 | Broad, long and mixed intent | Christmas parties plus festive dining near Heathrow | Clearer search intent |
| Enquiry delivery | Duplicate manager-notification risk | Management record first, Graph email fallback | One operational route per success |
| Mobile conversion | Competing sticky actions and overlays | One Christmas action, accessible drawer and visible success state | Clearer completion path |
| Claims and menu copy | Conflicting distances and unsourced detail | SSOT-aligned facts and current-menu language | Lower trust and freshness risk |
| Structured data | Long-running Event with hardcoded prices | Non-priced WebPage and Service graph linked to the shared business entity | Removes schema and visible-copy mismatch |
| Testimonials | Three quotes without source records | Removed after owner approval | Removes unsupported social proof |
| Internal freshness | Old sitemap date | Genuine 10 July 2026 last-modified date | Supports recrawl of the updated page |

## Verification

- Editorial QA: pass, with both approval-gated items resolved.
- UX/CRO: pass on desktop and mobile, with mocked submissions only.
- Technical checks: lint, TypeScript, 52 focused tests, 100 full test suites (937 passed, 1 skipped) and production build all pass.
- No real customer enquiry was sent during testing.

## Next Measurement Phase

After deployment, verify the rendered metadata, canonical, schema and form delivery within 48 hours. Review GSC indexation and query ownership after one to two weeks, then compare enquiries, impressions, clicks, CTR and position after six to eight weeks.
