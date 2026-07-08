# Analytics & Performance Report — The Anchor (www.the-anchor.pub)

Run: 7 July 2026 · Analytics Specialist · **Without-data track** — no GSC, GA4, CrUX, GTM-container or Vercel-env access this run. Every claim below is codebase evidence, live-HTML/bundle evidence, or explicitly marked inferred/unavailable. No traffic, ranking, conversion or CWV figures are stated because none exist from a real source.

---

## Data Access — what could not be checked this run

| Source | Status | Consequence |
|--------|--------|-------------|
| GSC property/exports | unavailable (inputs/input-summary.md) | No demand, indexation, CTR-gap, striking-distance or decay analysis; `analyse-search-data.py` not runnable; no search baseline |
| GA4 property | unavailable | Cannot confirm tags fire, key events exist, enhanced measurement settings, channel groups, filters |
| GTM container GTM-WWFQTQS export | unavailable | Cannot confirm dataLayer events are forwarded to GA4 at all |
| Vercel environment variables | unavailable | GA4 MP + CheersAI secrets unconfirmed; Meta Pixel var proven absent via bundle inspection (see below) |
| CrUX / PSI | unavailable (evidence/cwv-data-access.md) | No CWV baseline; `evidence/cwv.csv` = `unavailable` rows |
| GA4 DebugView / test submissions | unavailable | All "wired" claims are code-level, not firing-level proof |

Per the skill rule — commercially important actions that are untracked **or unverifiable** are an automatic Tier-1 finding — the measurement layer itself is the top-priority prerequisite of this whole audit.

## Performance Baseline

**There is no defensible traffic or conversion baseline this run.** The June 2026 workspace (and its snapshots) was deleted; no GSC/GA4 data was provided. The honest baseline is:

- **Crawl surface:** 240 pages fetched, 0 errors; 189 sitemap URLs + 51 discovered (evidence/audit-summary.md, url-inventory.csv). This freeze is the Stage-9 comparison point.
- **Tracking readiness:** instrumentation is unusually thorough at the code level (~45 track* functions, full booking funnels, attribution capture) but **unproven downstream of the dataLayer** and with two confirmed/likely-dead pipes (Meta Pixel; GA4 Measurement Protocol).
- **Demand/ranking:** all demand claims elsewhere in this audit are directional (Confidence: Low) — no first-party data.

Once T1–T3 (tracking-health-check.md) land, 4–8 weeks of clean GA4 + GSC data becomes the first real baseline. Do not judge any SEO change shipped from this audit against pre-fix numbers.

## GA4 / GTM / Tagging Health (summary — full table in tracking-health-check.md)

| Area | Status | Evidence | Risk | Required fix |
|------|--------|----------|------|--------------|
| GTM install (all templates) | pass | `app/layout.tsx:118` + live fetch of 6 templates, 7 Jul | Low | — |
| GA4 inside GTM + key events | unverified | No container/property access | Whole site could be unmeasured | T1 verification session |
| Consent Mode defaults (denied-first) | pass | `app/layout.tsx:191-222`, verified live | Low | T4 adds missing v2 keys |
| Consent v2 signals (`ad_user_data`/`ad_personalization`) | fail | Absent in code + live HTML | Ads/Signals degradation | T4 |
| Custom-event consent hard-gate | partial | `lib/tracking/dispatcher.ts:130`; `lib/cookies.ts:86-90` | Non-consenting visitors' conversions invisible; no consent-mode modelling possible | Owner decision (see finding 5) |
| SPA route-change page_views | unverified | `lib/use-analytics.ts` no-op relies on GA4 enhanced-measurement setting | Soft navigations unmeasured if toggle off | T1 |
| Table booking / event booking / private hire / phone events | pass (code) · unverified (firing) | Call sites verified: `ManagementTableBookingForm.tsx:1660-1684,2463-2482`, `ManagementEventBookingForm.tsx:537`, `PrivateBookingInquiryForm.tsx:190`, `PhoneLink/PhoneButton/Footer/StickyCtas` | Tier-1 if not firing | T1 |
| Server-side GA4 MP (`/api/analytics`) | unverified — likely fail | `app/api/analytics/route.ts:112-127` silent no-op; env vars an open June item | Server-side conversion copies silently dropped | T3 |
| Meta Pixel | **fail (proven)** | Bundle `3092-e9f8104d3173e504.js`: un-inlined `a.env.NEXT_PUBLIC_META_PIXEL_ID`, no ID literal; Clarity ID inlined in same build proves the mechanism | No Meta events at all since June deploy | T2 |
| Clarity | pass | ID `nh4v91dr6w` inlined; consent-gated init | Low | — |
| CheersAI conversions webhook | unverified | Wired dual-path; silently `not_configured` without secret (`lib/booking-conversion-forwarding.ts:52-55`) | Possible dark pipe | Confirm secret + logs |
| Attribution (landing_path/UTM/click IDs) | pass | `lib/booking-attribution.ts:67-118`, `dispatcher.ts:8-12,169-182` | Low | — |
| Phone/email tag coverage | partial | 3 pages raw `tel:`; ~13 pages raw `mailto:` (incl. private-hire set) | Enquiry-channel blind spots | T5 |
| AI-referral channel | unverified | GA4 config not accessible | AI referrals lumped into Direct/Referral | Measurement plan step 7 |

## Quick Win Opportunities

Without GSC/GA4 there are no position/CTR quick wins to mine this run. The quick wins that exist are measurement wins — each small, each unblocking the with-data track:

| Opportunity | Current state | Potential | Action required | Expected impact |
|-------------|--------------|-----------|-----------------|----------------|
| Turn Meta Pixel back on | Proven dead (env var absent at build) | All Meta attribution + future paid social | Set 1 Vercel env var + redeploy (T2) | Known: restores a whole channel's measurement. No volume claim — no data |
| Activate GA4 MP forwarding | Likely no-op (June open item) | Ad-blocker-resilient copies of all conversion events | Set 2 Vercel env vars + redeploy (T3) | Known: closes silent-drop path |
| Verify GTM→GA4 + mark 5 key events | Unverifiable | Trustworthy conversion reporting | 1 hour with GA4 DebugView (T1) | Prerequisite for every KPI below |
| Verify/claim GSC property | Not confirmed this run | Demand + indexation data for next audit | Verify `sc-domain:the-anchor.pub` (or URL-prefix on https://www.the-anchor.pub/), submit sitemap | Unblocks striking-distance/CTR-gap mining next run |
| Track email + missing phone links | ~16 pages leak | Private-hire enquiry-channel visibility | Component swaps (T5) | Directional — closes attribution blind spot on priority #2 |

## Declining Performance Alerts

None reportable — declining-performance analysis requires GSC/GA4 time series, which do not exist this run (Data status: unavailable). The June→July sitemap shrink from ~319 built pages to 189 sitemap URLs is noted in inputs/input-summary.md and belongs to the Technical Specialist; its traffic effect is unmeasurable without GSC.

## Segmented Performance

Not possible without first-party data. The segmentation framework to apply once data exists:

- **By page type:** plane-spotting/Heathrow content vs food/Sunday-roast pages vs private-hire pages vs event pages — maps directly to the "protect plane-spotting, grow commercial" posture.
- **By intent:** informational (plane-spotting, blog) vs transactional (/book-table, /private-hire, event pages). The strategic question the data must answer: what share of bookings originate on informational landing pages?
- **By conversion action:** table_booking_completed vs private_hire_enquiry_submitted vs event_booking_completed vs call_click — mirrors the owner's three commercial priorities plus the phone channel.

## Measurement Framework

### Primary KPIs (outcomes, not outputs)
1. **Table bookings from organic landing pages** — `table_booking_completed` key event segmented by `landing_path` (already captured in code). Priority #1 proxy: `sunday_roast_booking_completed` count.
2. **Private-hire enquiries** — `private_hire_enquiry_submitted` key event + tracked email clicks on private-hire pages.
3. **Event bookings** — `event_booking_completed` key event.
4. **Phone calls from the site** — `call_click` key event (imperfect proxy for calls; note in reporting).
5. **Organic clicks to commercial pages** (GSC) — clicks to /book-table, /sunday-lunch, /private-hire, /whats-on cluster vs plane-spotting cluster.

Targets: none set — setting numeric targets now would violate the no-invented-data rule. Set them after the first 8 weeks of clean data.

### Leading indicators
- GSC impressions for the Sunday-roast and private-hire keyword clusters (post-GSC verification).
- Indexation coverage of the 189 sitemap URLs (GSC Pages report).
- Key-event count trend week-over-week once T1–T3 land.
- AI-referral sessions (directional only): GA4 custom channel group regex `^(chatgpt\.com|chat\.openai\.com|openai\.com|perplexity\.ai|gemini\.google\.com|copilot\.microsoft\.com|bing\.com/chat|claude\.ai|anthropic\.com|you\.com|poe\.com)` ordered above Referral. Caveats: most AI traffic is referrer-less (lands in Direct); AI Overviews clicks land in Organic — never read this channel as complete.
- Branded AI citations: keep a dated manual log of ~10 representative prompts ("best Sunday roast near Heathrow", "pub near Heathrow Terminal 5", "private hire venue Stanwell Moor") per assistant, noting whether The Anchor is named/linked. Directional signal only.

### The exact plan to reach the with-data track (owner actions)
1. **GSC**: verify `sc-domain:the-anchor.pub` (DNS TXT via Cloudflare) or URL-prefix `https://www.the-anchor.pub/`; submit `/sitemap.xml`; grant the audit service account read access; set `GOOGLE_APPLICATION_CREDENTIALS` so `fetch-search-data.py` runs next audit.
2. **GA4 env vars**: `GA4_MEASUREMENT_ID` + `GA4_API_SECRET` in Vercel (T3).
3. **Meta Pixel env var**: `NEXT_PUBLIC_META_PIXEL_ID` in Vercel + redeploy (T2).
4. **Key events**: mark `table_booking_completed`, `event_booking_completed`, `private_hire_enquiry_submitted`, `call_click`, `purchase` as GA4 key events (T1).
5. **GTM hygiene**: export GTM-WWFQTQS and archive it in the repo (`docs/` or the run workspace) so future audits can diff container config; confirm custom-event triggers exist for the five names above.
6. **GA4 settings**: enhanced measurement history-change ON; internal-IP filter active; `paypal.com` in unwanted referrals; GSC linked to GA4.
7. **AI channel group**: create as above.
8. **CWV**: set `CRUX_API_KEY`/`PAGESPEED_API_KEY` for the next run so `collect-cwv.py` returns field data.

### Reporting cadence
- **Weekly (5 min):** GA4 key-event counts by landing page; GSC clicks/impressions for the two clusters; 404/coverage anomalies.
- **Monthly:** cluster performance vs the four KPIs; booking-funnel step drop-off (`table_booking_funnel` steps exist for this); Clarity session review of /book-table abandonment; competitor SERP spot-check.
- **Quarterly:** organic contribution to bookings/enquiries; strategy review against the "protect plane-spotting, grow commercial" posture; re-run of this audit on the with-data track.
- **Tools:** GSC + GA4 native reports first; one Looker Studio page (GSC + GA4 connectors) once key events flow. No paid tools required at this site's scale.

## Measurement Governance

- **SEO change log:** every change from this overhaul logged before deploy (date, URLs, change, expected effect) — the run workspace already serves this; keep it going in `docs/` or the management app.
- **Alert rules (once data exists):** traffic drop >20% WoW (GA4 custom insight); key-event count = 0 for any of the five events over 7 days (catches silent tag death — exactly the Meta Pixel failure mode found today); 404 spike >50% WoW; indexation swing >10%; priority-keyword drop >5 positions when rank tracking exists. First responder: owner (no team).
- **Post-implementation validation windows** apply to every shipped change (see Post-Launch Validation Plan below).

## Post-Launch Validation Plan

| Shipped change | 0–48h checks | 1–2 week checks | 4–8 week checks | Baseline to compare |
|----------------|--------------|-----------------|-----------------|---------------------|
| T2 Meta Pixel env var | New bundle contains ID; Events Manager Test Events shows PageView/Purchase | Purchase events ≈ booking volume (dedup by eventID working) | Meta attribution usable for any paid tests | None (channel was dead) |
| T3 GA4 MP env vars | Test POST visible in Realtime | Server-side copies of `table_booking_completed` etc. arriving alongside client copies (no double-count — same event names; check dedup expectations) | Conversion counts stable vs client-only baseline | Client-only GA4 counts |
| T1 key events + GTM verification | DebugView screenshots of all 5 events | Key-events report populating; landing-page attribution present | First conversion baseline freeze | None — this creates the baseline |
| T4 consent v2 keys | Live HTML shows both keys | Tag Assistant consent state clean | — | — |
| T5 tel/mailto component swaps | Clicks visible in DebugView | `call_click`/`email_click` counts from affected pages > 0 | Enquiry-channel mix per page | None |
| Any SEO content/technical change from this overhaul | Rendered output, status codes, metadata, schema, tracking intact on changed URLs | GSC crawl/indexation of changed URLs; no new coverage errors | Clicks/impressions/CTR/position vs the crawl-freeze; key events on changed landing pages | 7 Jul crawl evidence freeze + first clean GA4/GSC weeks |

## What This Means for the Strategy Lead

1. **Nothing in this overhaul is measurable until T1–T3 land.** They are hours of work, not days, and two of them are single env vars. Sequence them before or alongside the first content/technical fixes so the 4–8 week window catches the effects.
2. **The code layer is not the problem.** This is the best-instrumented small-venue site I have audited at code level — funnels, attribution, dedup, consent hygiene are all present. The failure mode is operational: env vars and unverifiable Google-side config. The June audit flagged the GA4 vars; they are still unconfirmed a month later — treat "verify in Vercel" as a checklist item with an owner and a date this time.
3. **Consent hard-gating is a strategic choice the owner should make consciously** (finding 5): current design = zero data on non-consenting visitors, which suppresses every conversion metric by an unknown rate and forfeits GA4's consent-mode modelling. Either accept and document it, or relax to Consent-Mode-managed dispatch.
4. **Plane-spotting vs commercial segmentation is already wired** (`landing_path` on conversions) — the strategic question the owner cares about ("does Heathrow traffic convert?") is answerable within weeks of T1–T3, with zero extra build.

---

```json
{ "findings": [
  { "finding": "Conversion tracking is unverifiable end-to-end: GTM container contents, GA4 property config and key-event status cannot be confirmed, so all five commercial actions (table booking, event booking, private-hire enquiry, phone click, purchase) are wired in code but unproven in GA4 — automatic Tier-1 prerequisite", "evidence": "evidence/tracking-evidence.md; code call sites verified (components/features/TableBooking/ManagementTableBookingForm.tsx:1660-1684, components/features/EventBooking/ManagementEventBookingForm.tsx:537, components/PrivateBookingInquiryForm.tsx:190, components/PhoneLink.tsx); no GTM export or GA4 access this run", "source": "manual inspection (codebase + live HTML), tracking-evidence.md", "dataStatus": "Known", "severity": "Critical", "confidence": "High", "impactArea": "conversion", "owner": "Analytics", "effort": "Small", "dependencies": "Owner access to GA4 + GTM", "fixType": "Analytics/governance fix", "recommendedAction": "Run ticket T1 (tracking-health-check.md): export GTM-WWFQTQS, confirm GA4 config tag + custom-event triggers, mark table_booking_completed, event_booking_completed, private_hire_enquiry_submitted, call_click, purchase as GA4 key events; prove firing with one test booking/enquiry/call in DebugView", "validationStep": "All five events visible in GA4 DebugView and listed as key events; screenshots archived", "riskRollback": "None — verification and GA4 admin config only" },
  { "finding": "No verified GSC property confirmed this run — no demand, indexation or CTR data source exists, so the search side of the roadmap is unmeasurable (Do-now Tier-1 prerequisite)", "evidence": "inputs/input-summary.md: GSC exports NOT available; June workspace deleted; GOOGLE_APPLICATION_CREDENTIALS unset", "source": "inputs/input-summary.md", "dataStatus": "Known", "severity": "Critical", "confidence": "High", "impactArea": "SEO", "owner": "Analytics", "effort": "Small", "dependencies": "Owner Google account; Cloudflare DNS for domain property", "fixType": "Analytics/governance fix", "recommendedAction": "Verify sc-domain:the-anchor.pub (DNS TXT) or URL-prefix property for https://www.the-anchor.pub/, submit sitemap.xml, grant service-account read access and set GOOGLE_APPLICATION_CREDENTIALS for the next run", "validationStep": "GSC property shows coverage + performance data for the canonical domain; fetch-search-data.py produces search-queries.csv next run", "riskRollback": "None" },
  { "finding": "Meta Pixel is dead in production: NEXT_PUBLIC_META_PIXEL_ID was not set at build time, so ensureMetaPixel() always returns false — no PageView or Purchase events fire even with full marketing consent", "evidence": "Production bundle /_next/static/chunks/3092-e9f8104d3173e504.js contains un-inlined runtime reference `a.env.NEXT_PUBLIC_META_PIXEL_ID` and no pixel-ID literal in any scanned chunk, while Clarity's ID nh4v91dr6w IS inlined in app/layout-74a76e045fa192d6.js (proves inlining works when the var is set); lib/meta-pixel.ts:41-59", "source": "live production JS bundle inspection, 7 Jul 2026", "dataStatus": "Known", "severity": "High", "confidence": "High", "impactArea": "conversion", "owner": "Analytics", "effort": "Small", "dependencies": "Vercel access; redeploy", "fixType": "Analytics/governance fix", "recommendedAction": "Set NEXT_PUBLIC_META_PIXEL_ID=757659911002159 in Vercel production env and redeploy (build-time variable)", "validationStep": "New bundle contains the ID literal; Meta Events Manager shows PageView and a test-booking Purchase with eventID = booking reference", "riskRollback": "Unset the var and redeploy" },
  { "finding": "Server-side GA4 Measurement Protocol forwarding is likely a silent no-op: GA4_MEASUREMENT_ID/GA4_API_SECRET were never confirmed in Vercel (open since June) and /api/analytics returns success:true regardless, so ~24 event types lose their ad-blocker-resilient server-side copy without any error surfacing", "evidence": "app/api/analytics/route.ts:112-127 (no-op branch, unconditional success response); live GET /api/analytics = 200; inputs/input-summary.md June open item; note: purchase is never sent via MP (client-only) and MP is consent-gated by lib/tracking/dispatcher.ts:130 so it is redundancy, not consent bypass", "source": "codebase + live endpoint check + input-summary.md", "dataStatus": "inferred", "severity": "High", "confidence": "Medium", "impactArea": "conversion", "owner": "Analytics", "effort": "Small", "dependencies": "GA4 admin (API secret); Vercel access", "fixType": "Analytics/governance fix", "recommendedAction": "Create a Measurement Protocol API secret in GA4, set both env vars in Vercel, redeploy, and send a test event", "validationStep": "Test POST to /api/analytics appears in GA4 Realtime", "riskRollback": "Unset vars — route degrades gracefully by design" },
  { "finding": "Consent hard-gate drops every custom event client-side before the dataLayer when analytics consent is absent or undecided — conversions from non-consenting visitors are invisible and GA4 consent-mode modelling is impossible for these events; conversion counts undercount by an unknown rate", "evidence": "lib/tracking/dispatcher.ts:130 early return; lib/cookies.ts:86-90 (no cookie ⇒ analytics=false); only trackCookieConsent bypasses (lib/gtm-events.ts:865); Consent Mode denied-defaults verified live on 6 templates", "source": "codebase + live HTML inspection", "dataStatus": "Known", "severity": "Medium", "confidence": "High", "impactArea": "conversion", "owner": "Analytics", "effort": "Medium", "dependencies": "Owner privacy-posture decision", "fixType": "Template/system fix", "recommendedAction": "Owner decision: (a) keep strict gating and document the undercount in all reporting, or (b) push events unconditionally and let Google tags enforce consent via Consent Mode, enabling cookieless pings/modelling — recommend (b) for conversion events, keeping Meta strictly gated", "validationStep": "If changed: DebugView shows events arriving with consent state denied and GA4 reports modelled conversions", "riskRollback": "Revert dispatcher default; privacy policy must match whichever posture is chosen" },
  { "finding": "SPA route-change page_views depend on an unverifiable GA4 enhanced-measurement setting: the code deliberately no-ops (to avoid past double-counting) and trusts 'page changes based on browser history events' being ON in the GA4 stream", "evidence": "lib/use-analytics.ts (no-op with explanatory comment); components/tracking/AnalyticsProvider.tsx:10-13; GA4 stream settings inaccessible this run", "source": "codebase inspection", "dataStatus": "inferred", "severity": "Medium", "confidence": "Medium", "impactArea": "SEO", "owner": "Analytics", "effort": "Small", "dependencies": "GA4 admin access", "fixType": "Analytics/governance fix", "recommendedAction": "Confirm the history-events toggle is ON in GA4 Admin → Data Streams → Enhanced measurement; test one soft navigation in DebugView", "validationStep": "page_view fires on client-side route change in DebugView", "riskRollback": "None" },
  { "finding": "CheersAI booking-conversion webhook silently no-ops if CHEERSAI_BOOKING_CONVERSIONS_SECRET is unset — the dual-path forwarding (server proxy on confirmed bookings + client fire-and-forget) is well built but unverifiable from outside", "evidence": "lib/booking-conversion-forwarding.ts:52-55 (not_configured return); app/api/table-bookings/route.ts:329-378; lib/meta-pixel.ts:109-160; Vercel env inaccessible", "source": "codebase inspection", "dataStatus": "inferred", "severity": "Medium", "confidence": "Medium", "impactArea": "conversion", "owner": "Analytics", "effort": "Small", "dependencies": "Vercel access; CheersAI dashboard", "fixType": "Analytics/governance fix", "recommendedAction": "Confirm the secret is set in Vercel; check Vercel logs for '[booking-conversion]' errors; confirm a test booking reaches CheersAI", "validationStep": "Test booking appears in CheersAI booking-conversions", "riskRollback": "None" },
  { "finding": "Roughly 13 customer-facing pages use raw untracked mailto: links instead of the existing EmailLink component — including the private-hire commercial set (wakes, function-room-hire, corporate-events, private-party-venue, summer-garden-parties, corporate-christmas-parties), so email enquiries on commercial priority #2 pages are invisible", "evidence": "grep: pages containing mailto: without EmailLink — app/private-hire/wakes/page.tsx, app/function-room-hire/page.tsx, app/corporate-events/page.tsx, app/private-party-venue/page.tsx, app/summer-garden-parties/page.tsx, app/corporate-christmas-parties/page.tsx, app/live-music/page.tsx, app/heathrow-parking/page.tsx and others; components/EmailLink.tsx exists with trackEmailClick", "source": "codebase grep", "dataStatus": "Known", "severity": "Medium", "confidence": "High", "impactArea": "conversion", "owner": "Technical", "effort": "Small", "dependencies": "None", "fixType": "Template/system fix", "recommendedAction": "Replace raw mailto: anchors with <EmailLink source=\"page-slug\"> across the listed pages (ticket T5)", "validationStep": "grep -rl mailto: app/ | xargs grep -L EmailLink returns no page files; email_click visible in DebugView from one test click", "riskRollback": "Revert component swaps" },
  { "finding": "Consent Mode v2 signals ad_user_data and ad_personalization are missing from both the consent default and the consent update call", "evidence": "app/layout.tsx:202-219 and components/tracking/GTMProvider.tsx:28-32; verified absent in live HTML on all 6 templates checked", "source": "codebase + live HTML inspection", "dataStatus": "Known", "severity": "Low", "confidence": "High", "impactArea": "conversion", "owner": "Technical", "effort": "Small", "dependencies": "None", "fixType": "Template/system fix", "recommendedAction": "Add both keys (default denied; update mapped to marketing category) in the two locations (ticket T4)", "validationStep": "Live HTML contains both keys; Tag Assistant shows all four v2 consent signals", "riskRollback": "Revert two small edits" },
  { "finding": "Raw untracked tel: links on three local-area landing pages bypass the tracked PhoneButton/PhoneLink components", "evidence": "app/feltham-pub/page.tsx:455, app/egham-pub/page.tsx, app/bedfont-pub/page.tsx (grep for href tel: excluding PhoneLink/PhoneButton)", "source": "codebase grep", "dataStatus": "Known", "severity": "Low", "confidence": "High", "impactArea": "conversion", "owner": "Technical", "effort": "Small", "dependencies": "None", "fixType": "One-off page fix", "recommendedAction": "Swap for <PhoneButton source=\"feltham_pub|egham_pub|bedfont_pub\"> (ticket T5)", "validationStep": "call_click fires from each page in DebugView", "riskRollback": "Revert component swaps" },
  { "finding": "The standard (non-PayPal) booking success path omits the deposit value from the funnel-success call, so Meta Purchase (once the pixel is restored) and table_booking_completed report value 0 even for deposit bookings; the GA4 purchase push does carry deposit_amount", "evidence": "components/features/TableBooking/ManagementTableBookingForm.tsx:1660-1669 (no value passed) vs PayPal path :2463-2476 (value passed); lib/gtm-events.ts:482-490 uses data.value ?? 0 for Meta", "source": "codebase inspection", "dataStatus": "Known", "severity": "Low", "confidence": "High", "impactArea": "conversion", "owner": "Technical", "effort": "Small", "dependencies": "None", "fixType": "One-off page fix", "recommendedAction": "Pass value: bookingResult.deposit_amount ?? 0 into the step:'success' trackTableBookingFunnel call (ticket T6)", "validationStep": "Test deposit booking emits Meta Purchase with value > 0", "riskRollback": "Revert one-line change" },
  { "finding": "No AI-referral channel grouping exists (or is verifiable) in GA4 — AI-assistant referrals fall into Referral/Direct and AI-visibility impact cannot be read at all", "evidence": "GA4 property inaccessible this run; no code-level grouping (correctly — this is GA4 config)", "source": "manual inspection; GA4 unavailable", "dataStatus": "unavailable", "severity": "Low", "confidence": "Low", "impactArea": "AI visibility", "owner": "Analytics", "effort": "Small", "dependencies": "GA4 admin access", "fixType": "Analytics/governance fix", "recommendedAction": "Create a GA4 custom channel group matching AI-assistant referrer domains ordered above Referral (regex in measurement plan); treat as directional — most AI traffic is referrer-less and AI Overviews clicks land in Organic", "validationStep": "Sessions from perplexity.ai classify into the AI channel", "riskRollback": "Delete channel group" },
  { "finding": "GA4 key-event configuration for the five commercial events is unknown and must be assumed absent until proven — without key-event status, conversion reporting and any future Ads import have no source of truth", "evidence": "GA4 property inaccessible; events defined in lib/gtm-events.ts but key-event marking is GA4-side config", "source": "GA4 unavailable", "dataStatus": "unavailable", "severity": "Medium", "confidence": "Medium", "impactArea": "conversion", "owner": "Analytics", "effort": "Small", "dependencies": "GA4 admin access", "fixType": "Analytics/governance fix", "recommendedAction": "Within ticket T1: mark table_booking_completed, event_booking_completed, private_hire_enquiry_submitted, call_click, purchase as key events", "validationStep": "GA4 Admin → Key events lists all five", "riskRollback": "Unmark key events" }
] }
```
