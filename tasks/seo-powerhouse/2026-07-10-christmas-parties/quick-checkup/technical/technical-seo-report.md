# Technical SEO Audit

Date: 2026-07-10  
Scope: `https://www.the-anchor.pub/christmas-parties` and its direct enquiry flow

## Executive verdict

The page is crawlable and indexable. It returns 200, is self-canonical, is in the XML sitemap, has one H1, is server-rendered with substantial content, and has 30 sampled inbound internal links. Crawl discovery is not the problem.

The immediate technical risk is the booking path. The website sends times such as `6:30 pm` or `Flexible`, while the management endpoint accepts only `HH:mm`. The management write therefore rejects the payload, but the website logs the error and still returns success after sending the email. The page also has route-unaware global and local Christmas overlays that can compete with each other and with the specialised enquiry drawer.

## Critical Issues

### 1. Christmas enquiries silently fail to enter the management system

- **Root cause:** `app/christmas-parties/client-components.tsx` sends display-formatted times such as `6:30 pm`; its short lightbox sends `Flexible`. `app/api/enquiry/christmas/route.ts:194-218` forwards that body unchanged. The management contract at `/Users/peterpitcher/Cursor/OJ-AnchorManagementTools/src/app/api/external/create-booking/route.ts:20-34` accepts `preferredTime` only when it matches `^([01]\d|2[0-3]):[0-5]\d$`.
- **Impact:** the management endpoint returns 400, no draft private booking is created, and the website still responds with `{ success: true }` because the management failure is only logged. The email is still sent, so the lead is not necessarily lost, but the operational booking record and follow-up workflow are unreliable.
- **Do now:** use machine values such as `18:30` with separate display labels; never send `Flexible` to a time-only field; validate the website request server-side; preserve journey, meal service and CTA source in the accepted management payload or internal notes; add monitoring for rejected management writes.
- **Acceptance:** test party, lunch and dinner submissions all create one management record, send one email, retain their journey/service/source, and return success only under the agreed fallback policy.
- **Rollback:** keep the existing email path as the fallback while reverting the management mapping if production writes fail.

### 2. Page-specific and global conversion UI can interrupt each other

- **Root cause:** `app/layout.tsx:280-286` mounts the global Christmas lightbox on every route. That lightbox triggers at 10 seconds or exit intent during its campaign (`components/features/christmas/ChristmasLightbox.tsx:15-16,107-126`). The page mounts a second Christmas lightbox with an independent storage key and a 35-second/exit trigger (`app/christmas-parties/client-components.tsx`, `ChristmasLightbox`). The global sticky bar also appears on every route except `/book-table` and links its main action to the generic table-booking page (`components/layout/StickyCtas.tsx:48-50,117-143`).
- **Impact:** during the Christmas campaign, one exit-intent action can open two modals. The global lightbox at z-index 100 can also appear above the page enquiry drawer at z-index 90. The generic sticky “Book a table” action takes visitors away from the specialist party/pre-order enquiry path.
- **Do now:** allow only one Christmas overlay on this route; suppress the global Christmas lightbox on `/christmas-parties`; suppress or adapt the global sticky CTA so its primary action opens the Christmas enquiry journey; do not let any campaign timer open while a form drawer or modal is active.
- **Acceptance:** after 10, 35 and 60 seconds, on exit intent, and while the drawer is open, no competing overlay appears; the only persistent primary CTA keeps visitors in the Christmas enquiry flow.
- **Rollback:** restore the global components for this route if the route-specific CTA fails, while retaining the page's inline enquiry action.

## Crawlability & Indexation

| Check | Status | Details | Impact | Fix |
|---|---|---|---|---|
| HTTP status | Pass | Live URL returns 200 with no redirect | None | Monitor |
| Indexation directives | Pass | `meta robots=index, follow` and `X-Robots-Tag: all` | None | Monitor |
| Canonical | Pass | Self-canonical to `https://www.the-anchor.pub/christmas-parties` | None | Monitor |
| XML sitemap | Pass | Target is present in the sitemap | None | Monitor |
| Soft 404 | Pass | Collector marked `soft_404_candidate=no` | None | Monitor |
| Render dependency | Partial evidence | Formal raw/rendered diff was unavailable because Python Playwright was not installed, but the plain fetch found the title, H1, schema, links and 4,569 words in the server response | Low current risk | Re-run rendered evidence after release |
| Robots | Pass for target | `robots.txt` allows the public page and references the sitemap | None | Monitor |

No indexation change is recommended. Do not change the canonical, robots directives, URL or sitemap inclusion during this optimisation.

## Site Architecture & Internal Linking

The target is not orphaned. The sampled graph records 30 inbound and 136 outbound links. Breadcrumb JSON-LD is present and complete. This is already a strongly discovered commercial page, so sitewide link acquisition is lower priority than fixing the booking path and factual consistency.

The related corporate and budget Christmas URLs have lower sampled inbound counts, but query overlap cannot be diagnosed without GSC. Schedule any topic-ownership or anchor changes until page/query data is available.

## Performance & Core Web Vitals

| Metric | Current | Target | Issue | Recommendation |
|---|---|---|---|---|
| LCP | Unavailable | Use Google's current good threshold | CrUX/PSI access returned no usable data | Collect mobile field data if eligible, otherwise run a repeatable lab test after release |
| INP | Unavailable | Use Google's current good threshold | No field data | Test drawer, mode switch and form interactions in a lab run |
| CLS | Unavailable | Use Google's current good threshold | No field data | Check cookie banner, sticky CTAs and delayed lightboxes during lab QA |
| TTFB | Unavailable | Evidence-led | No field/lab result | Monitor; current live response was cache-served |

The hero uses `next/image` with `priority` and `sizes="100vw"`, and the source JPEG is 211 KB. The crawler found no missing alt text. There is not enough evidence to claim a performance pass or failure, so broad performance work is **Monitor**, not an immediate ticket.

## Mobile Usability

The existing responsive pass materially improved the page:

- mobile uses pricing cards while desktop uses the table;
- 320 px and 390 px screenshots show no horizontal overflow;
- the enquiry drawer and local lightbox are viewport-safe and scrollable;
- the floating enquiry trigger is positioned above the global sticky bar;
- responsive unit coverage exists in `tests/unit/christmas-parties-responsive.test.ts`.

One conversion issue remains: the current H1 occupies roughly seven lines in the 320 px top screenshot, pushing the booking actions below the first viewport. Shortening the H1 and showing the two booking choices immediately after the hero is a **Do now** content/UX fix. Re-test at 320, 390, 768 and 1440 widths, including a short-height mobile viewport and both enquiry journeys.

## Structured Data

| Page Type | Current Schema | Missing / inaccurate | Rich Result Opportunity |
|---|---|---|---|
| Venue identity | Global `Organization` and `Restaurant`/`BarOrPub` | Core NAP, geo, social profiles and live-fetched hours are present | Retain |
| Navigation | `BreadcrumbList` | Complete in offline validation | Retain |
| FAQ | `FAQPage` with visible questions | Rich result is retired for this type of business; keep only if it remains useful machine-readable content and exactly matches the visible page | Do not spend effort chasing FAQ rich results |
| Christmas offer | One `Event` covering 1 Nov to 23 Dec with four priced offers and three priced add-ons | It models a seasonal service window as one event, hardcodes food prices, and repeats the 10–150 capacity claim | Replace with accurate non-priced page/service markup, or emit individual Events only for genuine scheduled party nights with visible approved details |

The price-bearing Event block is the main schema defect. `app/christmas-parties/page.tsx:31-171` exposes prices from £9.95 to £39.95, while `docs/SSOT.md:3` and `SSOT.json:857-862` require live Christmas food and buffet pricing. The visible page asks visitors to enquire for current pricing, so schema and visible content do not match.

**Do now:** remove the stale Event/offers block unless it can be generated from approved live event data. If this URL represents an evergreen booking service, use accurate `WebPage`/`Service` context without invented price or rich-result promises. Retain the valid global venue schema and breadcrumb. Re-run the offline validator and inspect the rendered JSON-LD after release.

The validator's recommended `Organization.contactPoint` and `WebSite.potentialAction` gaps are low priority. They do not justify delaying the booking and schema-parity fixes.

## Security & Trust

HTTPS and the main response headers pass this page-level check: HSTS, CSP, `X-Content-Type-Options`, frame protection, referrer policy and permissions policy are present. No mixed-content problem was found in the collected evidence.

Commercial-fact trust is weaker than transport security. The live metadata says 10+ to 150 guests, while the canonical Christmas capacity is 60 seated or 200 standing (`docs/SSOT.md:213-223`). The page and copy deck also contain conditions not recorded in the canonical SSOT, including a six-person festive-menu minimum, a seven-day pre-order deadline and optional 10% service charge. These may be correct, but they are not source-verifiable from the current SSOT.

**Do now:** use the confirmed Christmas capacity and £10 per-person non-refundable Christmas-menu deposit; state “pre-order only” as supplied by the owner; confirm every other deadline, minimum, charge and service promise before retaining it, then add approved facts to the SSOT through the normal governance process.

## Image SEO

The target has six images and zero missing alt attributes in the crawl. The hero is intentionally decorative with an empty alt and is loaded through `next/image`; below-fold images use responsive sizing. No image SEO blocker was found. Monitor the 211 KB source hero in lab performance testing rather than replacing it without LCP evidence.

## Local SEO

The global venue schema includes consistent website NAP, geo coordinates, parking-related amenities and `sameAs` references. The page clearly names Stanwell Moor, Heathrow and Staines. GBP accuracy and external citation consistency were unavailable, so no claim is made about them. Do not create more near-duplicate location pages without GSC demand and cannibalisation evidence.

## AI Search & Entity Readiness

The live `robots.txt` does not block search/user crawlers. Direct checks returned 200 for OAI-SearchBot, ChatGPT-User, Claude-SearchBot, PerplexityBot and Googlebot. `/llms.txt` exists and returns 200. The key page content is present in server HTML.

The main AI/entity risk is factual contradiction, not access. Align capacity, pricing, deposit and pre-order claims across visible copy, metadata and schema. Do not add more generic FAQs as an AI tactic.

## Content Lifecycle

The permanent `/christmas-parties` URL is correct for annual reuse. However, 2026 wording and schema require a documented rollover. The global navigation begins showing “Christmas 2026” from 1 August with no end condition (`app/layout.tsx:158-165`), while the global lightbox ends on 15 December and the page Event ends on 23 December.

**Schedule:** add an explicit post-season state and owner/date for the 2027 rollover. After 23 December, remove expired event markup and prevent the navigation from promoting “Christmas 2026” indefinitely. Validate the page after each seasonal transition.

## Prioritised Fix List

| Priority | Decision | Issue | Impact | Effort | Dependency |
|---|---|---|---|---|---|
| 1 | Do now | Normalise times and make management forwarding observable and contract-compatible | Revenue / conversion | Small | Website and management developers |
| 2 | Do now | Update API model to preserve party vs meal, lunch vs dinner and CTA source | Conversion / operations | Medium | Website and management developers |
| 3 | Do now | Remove route-level duplicate lightboxes and adapt/suppress the global sticky CTA | Conversion / UX | Small | Website developer |
| 4 | Do now | Remove or regenerate stale price-bearing Event schema | SEO trust / revenue | Medium | Developer and approved schema decision |
| 5 | Do now | Shorten rendered title/H1 and align metadata/capacity/pre-order facts to the SSOT | SEO / conversion | Small | Content and owner confirmation |
| 6 | Schedule | Confirm unsupported booking terms and write approved facts into the SSOT | Revenue / trust | Small | Owner and content governance |
| 7 | Schedule | Add a post-season expiry and 2027 rollover | SEO / trust | Small | Content owner and developer |
| 8 | Monitor | Obtain repeatable mobile CWV evidence | SEO / UX | Small | PSI key or lab runner |
| 9 | Reject | Add more FAQ markup to chase a rich result | No supported benefit | Small | None |

```json
{"findings":[{"finding":"Christmas enquiry times are incompatible with the management booking API, and the website reports success even when the management write fails.","evidence":"app/christmas-parties/client-components.tsx sends display values such as 6:30 pm and Flexible; app/api/enquiry/christmas/route.ts:194-218 forwards the body, logs non-OK management responses and still returns success; /Users/peterpitcher/Cursor/OJ-AnchorManagementTools/src/app/api/external/create-booking/route.ts:20-34 only accepts preferredTime matching HH:mm.","source":"Manual code and cross-system contract inspection","dataStatus":"Known","severity":"Critical","confidence":"High","impactArea":"revenue","owner":"Technical","effort":"Small","dependencies":"Website developer, management-app developer and test credentials","fixType":"Template/system fix","recommendedAction":"Send 24-hour machine time values, validate the request server-side, define an explicit fallback policy and monitor every rejected management write.","validationStep":"Submit party, lunch and dinner enquiries and confirm each creates exactly one management record and one email with no 400 response.","riskRollback":"Keep Microsoft Graph email delivery as the fallback and revert the management mapping if production writes fail."},{"finding":"The enquiry data model does not reliably preserve the two commercial journeys and meal service end to end.","evidence":"app/api/enquiry/christmas/route.ts:9-22 models only dinner or buffet; the management schema at /Users/peterpitcher/Cursor/OJ-AnchorManagementTools/src/app/api/external/create-booking/route.ts:20-34 has no mode, service or source fields and fixes event_type to Christmas Party at lines 130-141.","source":"Manual code and API-contract inspection","dataStatus":"Known","severity":"High","confidence":"High","impactArea":"conversion","owner":"Technical","effort":"Medium","dependencies":"Website developer, management-app developer and enquiry recipient","fixType":"Template/system fix","recommendedAction":"Use party and meal as the journey, require lunch or dinner for meals, carry CTA source, and map these values into accepted fields or structured internal notes with backward compatibility.","validationStep":"Inspect the API request, email and management record for one party, one lunch and one dinner submission and confirm all fields remain distinct.","riskRollback":"Preserve support for the old dinner and buffet values until all clients and recipients have moved to the new contract."},{"finding":"Two independent Christmas lightboxes and the global sticky CTA compete with the specialist enquiry flow on the target route.","evidence":"app/layout.tsx:280-286 mounts the global lightbox on every route; components/features/christmas/ChristmasLightbox.tsx:107-126 triggers after 10 seconds or exit intent; app/christmas-parties/client-components.tsx mounts another timed and exit-intent ChristmasLightbox; components/layout/StickyCtas.tsx:117-143 links the primary sticky action to /book-table and only excludes /book-table.","source":"Manual component and route inspection","dataStatus":"Known","severity":"High","confidence":"High","impactArea":"conversion","owner":"UX","effort":"Small","dependencies":"Website developer","fixType":"Template/system fix","recommendedAction":"Suppress the global Christmas lightbox on /christmas-parties, allow only one active enquiry surface, and adapt or hide the global sticky CTA so the page retains visitors in the Christmas journey.","validationStep":"Test timer, exit-intent and open-drawer states on desktop and mobile; confirm one overlay maximum and one route-appropriate primary CTA.","riskRollback":"Restore the global components for this route if the page-owned enquiry action fails, while keeping the inline form available."},{"finding":"The page Event JSON-LD hardcodes stale food prices and models a multi-week booking service as one Event.","evidence":"app/christmas-parties/page.tsx:31-171 contains a 1 November to 23 December Event with four priced offers and three priced add-ons; docs/SSOT.md:3 and SSOT.json:857-862 require Christmas food and buffet pricing from the live approved source; the visible page asks visitors to confirm current pricing.","source":"Live schema crawl, offline schema validation and manual SSOT/code inspection","dataStatus":"Known","severity":"High","confidence":"High","impactArea":"SEO","owner":"Technical","effort":"Medium","dependencies":"Developer and approved schema decision","fixType":"One-off page fix","recommendedAction":"Remove the price-bearing Event block unless it can be generated from approved live event data; otherwise use accurate non-priced WebPage/Service context and individual Event markup only for genuine scheduled nights.","validationStep":"Inspect rendered JSON-LD, confirm every retained claim is visible and current, and rerun the offline validator after release.","riskRollback":"Store the old JSON-LD block and restore it only if a verified Search Console regression is attributable to this change."},{"finding":"Rendered metadata and prominent copy mix private-hire capacity with Christmas capacity, and the title/H1 are too long for the page's mobile conversion hierarchy.","evidence":"evidence/page-metadata.csv records a 79-character rendered title, a long multi-intent H1 and a meta description stating 10+ to 150 guests; docs/SSOT.md:213-223 gives Christmas capacity as 60 seated or 200 standing; output/playwright/christmas-layout/mobile-320-top.png shows the H1 wrapping to roughly seven lines with the booking actions below the initial viewport.","source":"collect-site-evidence.py, canonical SSOT and Playwright screenshot inspection","dataStatus":"Known","severity":"High","confidence":"High","impactArea":"conversion","owner":"Content","effort":"Small","dependencies":"Content approval","fixType":"One-off page fix","recommendedAction":"Use a concise absolute title and H1 centred on Christmas parties and festive dining, update metadata to confirmed Christmas facts, and show the two booking choices immediately after the hero.","validationStep":"Re-crawl the page, confirm one shorter title and H1 with consistent capacity facts, and recheck 320, 390, 768 and 1440 layouts.","riskRollback":"Retain the previous metadata and H1 strings for one-commit rollback if a verified search regression occurs."},{"finding":"Several commercial booking conditions on the page are not traceable to the canonical SSOT.","evidence":"app/christmas-parties/client-components.tsx states a six-person festive-menu minimum, seven-day pre-order deadline and optional 10 percent service charge; docs/SSOT.md confirms the Christmas deposit, Christmas capacity and that pre-order language is allowed, but does not confirm those additional conditions.","source":"Manual page and SSOT comparison","dataStatus":"Known","severity":"High","confidence":"High","impactArea":"revenue","owner":"Content","effort":"Small","dependencies":"Owner confirmation and content governance","fixType":"Content process fix","recommendedAction":"Confirm each deadline, minimum, charge and service promise with the owner; retain only approved facts and record them in the canonical SSOT.","validationStep":"Run a line-by-line fact check against the updated SSOT and confirm visible copy and schema use the same values.","riskRollback":"Remove unconfirmed claims immediately and restore only after owner approval is recorded."},{"finding":"The 2026 seasonal page and navigation lack a complete post-season rollover state.","evidence":"app/layout.tsx:158-165 starts the Christmas 2026 navigation CTA on 1 August but has no end condition; app/christmas-parties/page.tsx marks the Event through 23 December 2026.","source":"Manual lifecycle code inspection","dataStatus":"Known","severity":"Medium","confidence":"High","impactArea":"SEO","owner":"Technical","effort":"Small","dependencies":"Content owner and developer","fixType":"Template/system fix","recommendedAction":"Add a post-season navigation state, remove expired Event markup after the service window and assign the 2027 rollover date and owner.","validationStep":"Use clock-controlled tests before, during and after the campaign dates and verify no expired 2026 promotion remains after 23 December.","riskRollback":"Keep the evergreen URL live while reverting only the campaign CTA and dated schema state."}]}
```
