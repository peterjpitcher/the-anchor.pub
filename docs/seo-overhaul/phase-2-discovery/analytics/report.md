# Analytics & Measurement Report -- The Anchor SEO Overhaul

**Date:** 22 March 2026
**Author:** Analytics Specialist (Phase 2 Discovery)
**Status:** Complete -- ready for implementation

---

## 1. Current Tracking Infrastructure Audit

### 1.1 Stack Overview

| Component | Status | Notes |
|-----------|--------|-------|
| Google Tag Manager (GTM-WWFQTQS) | Active | Inline script in `app/layout.tsx` head, noscript fallback in body |
| GA4 (via GTM) | Active | Enhanced measurement handles page_view automatically |
| Microsoft Clarity | Active | Session replay + heatmaps, consent-gated via `lib/use-clarity.ts` |
| Google Consent Mode v2 | Active | Full implementation in `lib/cookies.ts` + `GTMProvider.tsx` |
| Core Web Vitals | Active | `app/web-vitals.tsx` sends to both GTM dataLayer and `/api/web-vitals` endpoint |
| Server-side analytics API | Partial | `/api/analytics` endpoint exists but only logs in dev mode -- no production persistence |

### 1.2 Event Tracking Inventory

The tracking layer (`lib/gtm-events.ts`) defines 30+ event functions pushed to the GTM dataLayer. Here is the complete inventory with implementation status:

#### Conversion Events (Revenue-Critical)

| Event | Function | Implemented In Components | Verdict |
|-------|----------|--------------------------|---------|
| `table_booking_click` | `trackTableBookingClick()` | BookTableButton, FloatingActions, multiple CTA locations | Well-covered |
| `table_booking_funnel` (7 steps) | `trackTableBookingFunnel()` | ManagementTableBookingForm, BookingDatePicker, SundayLunchBooking, CustomerDetails | Well-covered |
| `booking_wizard_step` | `trackBookingWizardStep()` | BookingWizard | Covered |
| `booking_wizard_complete` | `trackBookingWizardComplete()` | BookingWizard | Covered |
| `begin_checkout` (event ticket) | `trackEventBookingStart()` | ManagementEventBookingForm, EventBookingButton | Covered |
| `purchase` (event ticket) | `trackEventBookingComplete()` | ManagementEventBookingForm | Covered |
| `private_hire_enquiry_submitted` | `trackPrivateHireEnquirySubmitted()` | PrivateBookingInquiryForm | Covered, also sends to API |
| `phone_call_click` | `trackPhoneCallClick()` | PhoneButton, PhoneLink | Covered |
| `email_click` | `trackEmailClick()` | EmailLink | Covered |
| `whatsapp_click` | `trackWhatsAppClick()` | (limited usage) | Partially covered |

#### Engagement Events

| Event | Function | Implemented | Verdict |
|-------|----------|-------------|---------|
| `view_event` | `trackEventView()` | EventPageTracker | Covered |
| `view_menu` | `trackMenuView()` | (available but not widely called) | Under-used |
| `menu_page_view` / `food_menu_view` | MenuPageTracker | MenuPageTracker component | Well-covered |
| `menu_page_exit` / `food_menu_exit` | MenuPageTracker | MenuPageTracker component | Good -- tracks time on page |
| `scroll_depth` (25/50/75/90%) | `trackScrollDepth()` | ScrollDepthTracker (homepage only via DeferredHomepageTrackers) | Homepage only -- gap |
| `directions_click` | `trackDirectionsClick()` | DirectionsButton | Covered |
| `review_interaction` | `trackReviewClick()` | (available) | Unknown usage |
| `cta_click` + `food_cta_click` | `trackCtaClick()` | FoodStickyCtaBar, CTASection, Christmas CTAs, Lightboxes | Good coverage |
| `context_cta_click` | `trackContextCtaClick()` | (available) | Unknown usage |
| `navigation_click` | `trackNavigationClick()` | (available) | Unknown usage |
| `filter_change` | `trackFilterChange()` | (available) | Unknown usage |
| `social_click` | `trackSocialClick()` | (available) | Unknown usage |
| `faq_item_opened` | `trackFaqItemOpened()` | (available) | Unknown usage |
| `form_start` / `form_complete` / `form_abandon` | `trackFormStart/Complete/Abandon()` | BookingDatePicker, SundayLunchBooking, CustomerDetails, TableBookingForm | Good coverage on booking forms |
| `check_opening_hours` | `trackOpeningHoursCheck()` | (available) | Unknown usage |
| `flight_status_check` | `trackFlightStatusCheck()` | (available) | Unknown usage |

#### System Events

| Event | Function | Status |
|-------|----------|--------|
| `web_vitals_reported` | `trackWebVitals()` | Active -- CLS, LCP, FID, TTFB, INP |
| `error` | `trackError()` | Available -- unknown if wired to error boundaries |
| `cookie_consent_update` | `trackCookieConsent()` | Active -- fires on consent changes |
| `banner_interaction` | `trackBannerEvent()` | EventCountdownBanner |
| `modal_open/engage/close` | `trackModal*()` | ChristmasLightbox, SixNationsLightbox |
| `sticky_cta_shown` | `trackStickyCtaShown()` | FoodStickyCtaBar |
| `anchor_nav_click` | `trackAnchorNavClick()` | (available) | Unknown usage |

### 1.3 Architecture Assessment

**Strengths:**
- Clean separation: `gtm-events.ts` (event definitions) -> `dispatcher.ts` (consent gating + dataLayer push)
- Consent Mode v2 properly implemented -- events are suppressed before consent
- PII redaction built into the dispatcher (`redactPotentialPII()`)
- API batching with `sendBeacon` fallback for reliable delivery on page exit
- Device type detection auto-injected into every event

**Weaknesses:**
- `/api/analytics` endpoint is a stub -- events sent with `sendToApi: true` are logged in dev only, discarded in production
- Many tracking functions are defined but appear unused (see "Unknown usage" above) -- dead code or missing wiring
- `ScrollDepthTracker` only runs on the homepage; high-value pages like `/sunday-lunch`, `/private-hire`, `/food-menu` have no scroll tracking
- No tracking of organic search landing page performance (which page a user entered on)
- Web vitals endpoint `/api/web-vitals` referenced in `web-vitals.tsx` but the route file was not found -- likely a 404 in production
- `view_menu` function exists separately from `MenuPageTracker` -- potential duplication

---

## 2. Performance Baseline (Research-Estimated)

### 2.1 Current Organic Performance (from Strategy Document)

| Metric | Value | Source |
|--------|-------|--------|
| Monthly organic clicks | 622 | GSC (March 2026 audit) |
| Monthly impressions | 39,040 | GSC |
| Overall CTR | 1.6% | GSC |
| Indexed pages | ~195 | GSC |
| Mobile avg position | 13.07 | GSC |
| Desktop avg position | 22.35 | GSC |
| YoY click growth | +106% | GSC |
| Rich result impressions | 1,463 | GSC |

### 2.2 Estimated Organic Visibility by Keyword Cluster

| Cluster | Estimated Monthly Search Volume (cluster total) | Estimated Current Clicks | Estimated Visibility | Assessment |
|---------|----------------------------------------------|------------------------|---------------------|------------|
| Brand/Navigational | ~630 | ~214 | Strong | Homepage captures most brand traffic |
| Heathrow Proximity | ~3,800 | ~50 | Moderate | Ranking pos 3-5 but 0.7% CTR on /near-heathrow |
| Food & Sunday Roast | ~16,000 | ~45 | Weak | High volume, low CTR, cannibalisation hurting |
| Private Hire & Venue | ~1,100 | ~5 | Very Weak | Invisible vs aggregators and hotels |
| Entertainment & Events | ~2,200 | ~15 | Moderate (niche) | Owns quiz night, weak on broader terms |
| Beer Garden & Plane Spotting | ~2,600 | ~115 | Strong (niche) | Owns these queries |
| Heathrow Parking | ~11,400 | ~21 | Negligible | Cannot compete on head terms; blog format works |
| Local Area | ~1,200 | ~30 | Moderate | Owns Stanwell Moor; weak on Staines/Feltham |
| Hotel Guest Capture | ~200 | ~10 | Moderate | Niche pages performing adequately |
| Seasonal | ~1,500+ (peak) | ~20 | Moderate | Christmas is strongest seasonal play |

### 2.3 Page-Level Performance (Top Pages)

| Page | Monthly Clicks | Monthly Impressions | CTR | Avg Position | Revenue Link |
|------|---------------|-------------------|-----|-------------|-------------|
| / (homepage) | 214 | ~5,000 | ~4.3% | 5-8 | Brand entry point |
| /beer-garden | 86 | ~2,500 | ~3.4% | 1-3 | Footfall driver |
| /plane-spotting-heathrow | 27 | ~1,200 | ~2.3% | 2-4 | Footfall driver |
| /heathrow-parking (blog) | 21 | 6,080 | 0.35% | 10-15 | Parking revenue |
| /sunday-lunch (blog) | 19 | ~900 | ~2.1% | 5-10 | PRIMARY food revenue |
| /near-heathrow | 12 | 1,762 | 0.7% | 3-5 | Food + drinks |
| /food-menu | 16 | 1,642 | 1.0% | 8-12 | Food revenue |
| /sunday-lunch (page) | 9 | 774 | 1.2% | 5-10 | PRIMARY food revenue |
| /live-sport | 11 | 986 | 1.1% | 5-10 | Footfall driver |
| /quiz-night | 1 | 431 | 0.2% | 1-2 | Event revenue |
| /drinks | 1 | 551 | 0.2% | 5-10 | Drinks revenue |

### 2.4 Estimated Competitor Benchmarks

| Competitor | Estimated Monthly Organic Traffic | Key Strengths |
|-----------|--------------------------------|---------------|
| The Three Magpies (Bath Road) | 200-400 | Greene King chain SEO, closer to terminals |
| The Ostrich Inn (Colnbrook) | 300-600 | TripAdvisor authority, historic coaching inn angle |
| The Swan Hotel (Staines) | 500-1,000 | Hotel + venue + restaurant multi-category rankings |
| The London Stone (Staines) | 400-700 | Live music/entertainment authority |
| The Bells (Staines) | 200-400 | Sunday roast reputation |

**The Anchor (estimated):** 622 clicks/month -- competitive for a single independent pub, but the CTR gap means significant untapped potential.

---

## 3. Quick Win Opportunities

### 3.1 CTR Improvement Targets (Immediate Impact)

These pages already have Google impressions but are losing clicks to poor metadata:

| Page | Current CTR | Target CTR | Estimated Monthly Click Gain | Effort |
|------|------------|-----------|---------------------------|--------|
| /near-heathrow | 0.7% | 3.5% | +49 | Title/meta rewrite |
| /food-menu | 1.0% | 3.5% | +41 | Title/meta rewrite |
| /sunday-lunch | 1.2% | 4.0% | +22 | Title/meta rewrite + page enrichment |
| /quiz-night | 0.2% | 3.0% | +12 | Title/meta rewrite |
| /drinks | 0.2% | 2.5% | +13 | Title/meta rewrite |
| /live-sport | 1.1% | 3.0% | +19 | Title rewrite (clarify offering) |
| **Total** | | | **+156** | **2-3 hours work** |

### 3.2 Seasonal Opportunities (March-June 2026)

| Opportunity | Timing | Action | Revenue Link |
|-------------|--------|--------|-------------|
| Mother's Day | 15 March (PASSED) | Post-mortem: review performance for 2027 planning | Food |
| Easter (5-6 April) | 2 weeks away | Enrich /easter page NOW with pricing, booking CTA | Food |
| St George's Day (23 April) | 4 weeks | If any event planned, create/update page | Events |
| Father's Day (21 June) | 3 months | Enrich /fathers-day 4-6 weeks before | Food |
| Summer beer garden season | May-Sept | Optimise /beer-garden for seasonal "beer garden near me" surge | Footfall |
| World Cup 2026 (11 Jun - 19 Jul) | 3 months | /live-sport/world-cup page exists -- massive opportunity | Footfall + drinks |
| Summer private hire | May-Aug | Wedding/party season -- enrich /private-hire cluster now | Private hire |

### 3.3 Schema Quick Wins

| Action | Pages | Expected Benefit | Effort |
|--------|-------|-----------------|--------|
| Fix expired `availabilityEnds` date | /sunday-lunch | Unlocks existing rich result | 10 min |
| Import EventSeries schema | /quiz-night, /music-bingo, /cash-bingo | Event carousel in SERPs | 30 min |
| Add Menu + MenuItem schema | /food-menu, /pizza-menu, /burger-menu | Menu rich results, AI answers | 3 hrs |
| Deploy BreadcrumbList site-wide | All pages | Breadcrumb trail in SERPs | 2 hrs |

---

## 4. Measurement Framework

### 4.1 Primary KPIs (Tied to Business Revenue)

| KPI | Current Baseline | 3-Month Target | 6-Month Target | Measurement Source | Action If Off-Track |
|-----|-----------------|----------------|----------------|-------------------|-------------------|
| Monthly organic clicks | 622 | 1,000 | 1,500 | GSC | Audit underperforming pages, accelerate CTR fixes |
| Organic CTR | 1.6% | 3.0% | 4.0% | GSC | Review title tags of highest-impression pages |
| Table booking starts from organic | Unknown | 50/month | 100/month | GTM: `table_booking_funnel` where source=organic | Improve /book-table internal linking |
| Private hire enquiries from organic | Unknown | 10/month | 20/month | GTM: `private_hire_enquiry_submitted` | Enrich /private-hire content |
| Phone calls from organic landing | Unknown | 30/month | 60/month | GTM: `phone_call_click` | Add click-to-call CTAs to high-traffic pages |

### 4.2 Leading Indicators (Early Warning Signals)

| Indicator | Cadence | Source | What It Tells You |
|-----------|---------|--------|-------------------|
| Impressions by keyword cluster | Weekly | GSC | Whether new content is gaining visibility |
| Average position for P1 keywords | Weekly | GSC | Whether optimisation is moving rankings |
| Indexed page count | Weekly | GSC | Whether pruning is taking effect |
| Rich result impressions | Weekly | GSC | Whether schema fixes are working |
| Crawl stats (pages crawled/day) | Weekly | GSC | Whether pruning improved crawl efficiency |
| Menu page time-on-page | Monthly | GA4 (via MenuPageTracker) | Whether food content is engaging |
| Scroll depth on key pages | Monthly | GTM: `scroll_depth` | Whether content is being read |

### 4.3 Content Performance Metrics

| Metric | Target | Source | Action Threshold |
|--------|--------|--------|-----------------|
| Blog posts with >10 clicks/month | 8 (up from 2) | GSC | If <5 after Month 2, audit content quality |
| New blog post avg position after 30 days | <20 | GSC | If >30, review keyword targeting |
| Revenue page bounce rate | <50% | GA4 | If >60%, review page content/UX |
| /sunday-lunch conversion rate (to /book-table) | 5% | GTM funnel | If <2%, add stronger CTAs |
| /private-hire conversion rate (to enquiry form) | 3% | GTM funnel | If <1%, review content/pricing transparency |

### 4.4 Technical Health Metrics

| Metric | Target | Source | Action Threshold |
|--------|--------|--------|-----------------|
| Core Web Vitals (LCP) | <2.5s | CrUX / web-vitals endpoint | If >4s, investigate largest contentful element |
| Core Web Vitals (CLS) | <0.1 | CrUX / web-vitals endpoint | If >0.25, audit layout shifts |
| Core Web Vitals (INP) | <200ms | CrUX / web-vitals endpoint | If >500ms, audit JS bundle |
| Pages with crawl errors | 0 | GSC | Fix immediately |
| Mobile usability issues | 0 | GSC | Fix within 1 week |
| 404 error count | <5 new/week | GSC + server logs | Add redirects |

### 4.5 Reporting Cadence

| Report | Frequency | Audience | Contents |
|--------|-----------|----------|----------|
| SEO Pulse Check | Weekly | Internal | Position changes for P1 keywords, new crawl errors, indexed page count |
| Organic Performance Report | Monthly | Pub manager | Clicks, impressions, CTR by page cluster, booking/enquiry conversions from organic |
| Content ROI Report | Monthly | Internal | Blog post performance, new content rankings, content gap progress |
| Quarterly Business Review | Quarterly | Pub owner | Revenue page performance, competitive position changes, strategy adjustments |

---

## 5. Data Gaps & Missing Tracking

### 5.1 Critical Gaps (Must Fix)

| Gap | Impact | Fix | Priority |
|-----|--------|-----|----------|
| **No organic vs direct traffic segmentation in GTM events** | Cannot attribute bookings/enquiries to SEO effort | Add `traffic_source` parameter to all conversion events using `document.referrer` or UTM parsing | P1 |
| **`/api/web-vitals` route does not exist** | Web vitals data sent from `web-vitals.tsx` is hitting a 404 | Create the API route or remove the fetch call | P1 |
| **`/api/analytics` is a stub** | Events marked `sendToApi: true` (booking clicks, private hire enquiries, cookie consent) are discarded in production | Either connect to a data store or remove the server-side send | P1 |
| **No Google Search Console API integration** | Cannot programmatically monitor rankings or alert on drops | Set up GSC API access for automated reporting | P2 |
| **No conversion value tracking in GA4** | Cannot calculate organic traffic revenue | Assign monetary values to key conversions in GA4 | P2 |

### 5.2 Tracking Coverage Gaps

| Missing Tracking | Business Impact | Recommended Fix |
|-----------------|----------------|-----------------|
| Scroll depth on revenue pages | Cannot tell if users read /sunday-lunch, /private-hire content | Add ScrollDepthTracker to revenue pages, not just homepage |
| Landing page identification for conversions | Cannot tell which organic landing page drives bookings | Add `landing_page` parameter to conversion events |
| Internal search tracking | Cannot discover what visitors search for (if site search exists) | Add search event tracking if search is implemented |
| Outbound link clicks | Cannot track clicks to Google Maps, TripAdvisor, social profiles | Add outbound link click tracking |
| Print/save interactions on menu pages | Cannot tell if users save menus for later | Track print events on menu pages |
| Time-to-first-interaction on landing pages | Cannot measure engagement speed | Track first meaningful interaction timestamp |
| Booking form field-level abandonment | Cannot identify which form field causes drop-off | Extend `form_abandon` to include field-by-field progression |

### 5.3 Analytics Platform Gaps

| Gap | Impact | Recommended Fix |
|-----|--------|-----------------|
| No GA4 custom dimensions for SEO | Cannot segment by keyword cluster, page type, or content age | Configure custom dimensions: `page_type`, `keyword_cluster`, `content_age_days` |
| No GA4 custom audiences for SEO | Cannot create remarketing audiences from organic visitors | Create audiences: "Organic food searchers", "Organic venue searchers" |
| No Looker Studio / Data Studio dashboard | Reporting is manual | Build automated SEO dashboard pulling GSC + GA4 data |
| No automated alerting | Ranking drops go unnoticed until manual check | Set up GSC email alerts or third-party rank tracking |
| No competitor rank tracking | Cannot detect competitor movements | Set up Semrush/Ahrefs tracking for top 20 keywords |

---

## 6. Tracking Audit -- Detailed Findings

### 6.1 Conversion Tracking Completeness

**Table Booking Funnel:** GOOD
- 7-step funnel tracked: view -> start -> availability_check -> details_entered -> submit -> success -> error
- Device type captured at each step
- Party size, date, time captured
- Source attribution present
- `sendToApi: true` on initial click (but API is a stub)

**Event Booking Funnel:** GOOD
- Uses GA4 ecommerce events: `view_event` -> `begin_checkout` -> `purchase`
- Event ID, name, tickets, and monetary value captured
- Currency set to GBP

**Private Hire Enquiry:** ADEQUATE
- `private_hire_enquiry_submitted` fires on form submission
- Captures enquiry type and page source
- `sendToApi: true` for server-side backup
- Missing: form start/abandon tracking specific to private hire

**Phone/Email/WhatsApp Contact:** ADEQUATE
- Phone clicks tracked with source context
- Email clicks tracked with source and subject
- WhatsApp clicks tracked with context
- Missing: no tracking of which page the contact was initiated from (page_path is auto-added by dispatcher, so this is actually covered)

### 6.2 GTM Configuration Concerns

| Issue | Severity | Detail |
|-------|----------|--------|
| GTM script in `<head>` is render-blocking | Low | Standard GTM implementation, but async attribute not explicitly set on the injected script element (it is set inside the GTM snippet via `j.async=true`) -- this is fine |
| Consent default fires after GTM loads | Medium | `initializeConsentMode()` runs in a `useEffect` inside `GTMProvider`, which means GTM's initial data collection could fire before consent defaults are set. The `wait_for_update: 500` mitigates this but is not guaranteed |
| No data redaction in GTM container | Low | PII redaction happens in code (`redactPotentialPII`) but if GTM triggers collect URL parameters containing PII (e.g., email in URL), it bypasses code-level redaction |
| `keywords` meta tag still present | Negligible | `app/layout.tsx` includes a `keywords` metadata field. Google has ignored this since 2009. Not harmful but adds noise |

### 6.3 Microsoft Clarity Assessment

- Properly consent-gated (only initialises if analytics consent granted)
- Consent v2 integration is correct
- Provides heatmaps and session recordings that complement GA4 data
- No custom tags or user identification configured (appropriate for a pub website)

### 6.4 Tracking Events Not Wired to Components

These functions are defined in `lib/gtm-events.ts` but may not be called from any component:

| Function | Likely Status |
|----------|--------------|
| `trackNavigationClick()` | Defined but unclear if Navigation component uses it |
| `trackSocialClick()` | Defined but unclear if social links use it |
| `trackOpeningHoursCheck()` | Defined but unclear if hours display triggers it |
| `trackFlightStatusCheck()` | Defined but unclear if flight checker triggers it |
| `trackReviewClick()` | Defined but unclear if review links trigger it |
| `trackFilterChange()` | Defined but unclear if any filter UI uses it |
| `trackFaqItemOpened()` | Defined but unclear if FAQ accordions trigger it |

**Recommendation:** Audit each component where these would logically be called. Either wire them in or remove dead code.

---

## 7. Recommended Implementation Priority

### Immediate (Week 1)

1. **Create `/api/web-vitals` route** -- web-vitals.tsx is sending data to a non-existent endpoint
2. **Add traffic source to conversion events** -- essential for attributing SEO value
3. **Add scroll tracking to revenue pages** -- /sunday-lunch, /private-hire, /food-menu, /near-heathrow
4. **Set up GA4 conversion events** -- mark table_booking_funnel (step=success), private_hire_enquiry_submitted, and phone_call_click as conversions in GA4

### Short-term (Month 1)

5. **Assign conversion values in GA4** -- table booking = estimated avg spend, private hire = estimated avg booking value
6. **Configure GA4 custom dimensions** for page_type, keyword_cluster
7. **Build Looker Studio dashboard** with GSC + GA4 data
8. **Audit and wire unused tracking functions** or remove dead code
9. **Decide on /api/analytics endpoint** -- either connect to a data store or remove sendToApi calls

### Medium-term (Month 2-3)

10. **Set up automated rank tracking** for P1 keywords
11. **Configure GA4 audiences** for remarketing
12. **Implement outbound link tracking** for Google Maps, TripAdvisor, social
13. **Add field-level form abandonment tracking** to booking and enquiry forms
14. **Set up automated alerting** for ranking drops and crawl errors

---

## 8. GTM Tag Recommendations for SEO

Configure these tags in the GTM container to support SEO measurement:

| Tag | Trigger | Purpose |
|-----|---------|---------|
| GA4 Event: `generate_lead` | `private_hire_enquiry_submitted` | Track enquiry as GA4 conversion |
| GA4 Event: `begin_checkout` | `table_booking_funnel` step=start | Track booking intent |
| GA4 Event: `purchase` | `table_booking_funnel` step=success | Track completed bookings |
| GA4 Event: `purchase` (events) | `purchase` (event tickets) | Track ticket purchases |
| Custom HTML: Organic Landing Page | Page View (first hit) | Capture organic landing page in custom dimension |
| Scroll Depth trigger | Built-in GTM scroll trigger | Backup for code-level scroll tracking |
