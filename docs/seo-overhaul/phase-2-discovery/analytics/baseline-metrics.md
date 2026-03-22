# Baseline Metrics -- The Anchor SEO Overhaul

**Date:** 22 March 2026
**Purpose:** Quantified starting point for all SEO KPIs. Every metric here will be re-measured at 3 months (June 2026) and 6 months (September 2026).

---

## 1. Organic Search Performance

### 1.1 Aggregate Metrics

| Metric | Baseline (March 2026) | 3-Month Target | 6-Month Target | Measurement Source |
|--------|----------------------|----------------|----------------|-------------------|
| Monthly organic clicks | 622 | 1,000 (+61%) | 1,500 (+141%) | GSC |
| Monthly impressions | 39,040 | 50,000 (+28%) | 65,000 (+66%) | GSC |
| Overall CTR | 1.6% | 3.0% | 4.0% | GSC |
| Mobile avg position | 13.07 | 10.0 | 8.0 | GSC |
| Desktop avg position | 22.35 | 16.0 | 12.0 | GSC |
| Indexed page count | ~195 | 130 | 110 | GSC |
| Rich result impressions | 1,463 | 5,000 | 10,000 | GSC |
| Non-branded traffic share | ~15% | 30% | 40% | GSC (filtered) |

### 1.2 Clicks by Page (Top 10)

| Rank | Page | Clicks/Month | Impressions/Month | CTR | Target CTR (3mo) |
|------|------|-------------|-------------------|-----|-----------------|
| 1 | / (homepage) | 214 | ~5,000 | 4.3% | 5.0% |
| 2 | /beer-garden | 86 | ~2,500 | 3.4% | 4.5% |
| 3 | /plane-spotting-heathrow | 27 | ~1,200 | 2.3% | 3.5% |
| 4 | /heathrow-parking (blog) | 21 | 6,080 | 0.35% | 1.0% |
| 5 | /sunday-lunch (blog) | 19 | ~900 | 2.1% | 4.0% |
| 6 | /food-menu | 16 | 1,642 | 1.0% | 3.5% |
| 7 | /near-heathrow | 12 | 1,762 | 0.7% | 3.5% |
| 8 | /live-sport | 11 | 986 | 1.1% | 3.0% |
| 9 | /sunday-lunch (page) | 9 | 774 | 1.2% | 4.0% |
| 10 | /quiz-night | 1 | 431 | 0.2% | 3.0% |

### 1.3 Clicks by Keyword Cluster

| Cluster | Est. Monthly Clicks | Est. Monthly Impressions | Est. CTR | Target Clicks (3mo) |
|---------|-------------------|------------------------|----------|-------------------|
| Brand/Navigational | 214 | 5,000 | 4.3% | 250 |
| Heathrow Proximity | 50 | 4,500 | 1.1% | 120 |
| Food & Sunday Roast | 45 | 4,000 | 1.1% | 100 |
| Beer Garden & Plane Spotting | 115 | 4,000 | 2.9% | 140 |
| Entertainment & Events | 15 | 2,000 | 0.8% | 60 |
| Heathrow Parking | 21 | 6,500 | 0.3% | 40 |
| Local Area | 30 | 3,000 | 1.0% | 50 |
| Hotel Guest Capture | 10 | 1,500 | 0.7% | 20 |
| Private Hire & Venue | 5 | 1,500 | 0.3% | 30 |
| Seasonal | 20 | 2,000 | 1.0% | 40 |

---

## 2. Revenue Page Baselines

These pages directly drive revenue. Track them separately from general traffic.

| Page | Monthly Organic Clicks | Monthly Bookings/Enquiries (est.) | Conversion Rate (est.) | Target Clicks (3mo) |
|------|----------------------|----------------------------------|----------------------|-------------------|
| /book-table | Unknown (likely <20 organic) | Unknown | Unknown | 50 |
| /sunday-lunch | 9-19 (cannibalised) | 2-4 | ~20% | 50 |
| /food-menu | 16 | 3-5 (leads to /book-table) | ~25% | 40 |
| /private-hire | ~3 | <1 | <10% | 20 |
| /function-room-hire | ~2 | <1 | <10% | 15 |
| /corporate-events | ~1 | <1 | <10% | 10 |
| /christmas-parties | Seasonal (Nov-Dec peak) | Seasonal | Unknown | N/A until Q4 |
| /quiz-night | 1 | <1 | Unknown | 15 |
| /music-bingo | ~1 | <1 | Unknown | 10 |
| /heathrow-parking | 21 (blog), ~5 (page) | 1-2 | ~5% | 15 (page) |

**Critical data gap:** We have no baseline for organic-to-conversion rates because GTM events do not currently segment by traffic source. This is the single most important tracking gap to fix.

---

## 3. Technical Health Baselines

### 3.1 Core Web Vitals

| Metric | Target (Good) | Current Status | Source |
|--------|--------------|----------------|--------|
| LCP (Largest Contentful Paint) | <2.5s | Unknown (web-vitals data not persisted) | Fix /api/web-vitals first |
| CLS (Cumulative Layout Shift) | <0.1 | Unknown | Fix /api/web-vitals first |
| INP (Interaction to Next Paint) | <200ms | Unknown | Fix /api/web-vitals first |
| TTFB (Time to First Byte) | <800ms | Expected good (Vercel Edge) | Fix /api/web-vitals first |

**Action required:** Create the `/api/web-vitals` endpoint to start collecting this data, or check CrUX report in PageSpeed Insights.

### 3.2 Indexation Health

| Metric | Baseline | Target (3mo) |
|--------|----------|-------------|
| Total indexed pages | ~195 | 130 |
| Pages with crawl errors | Unknown | 0 |
| Pages with redirect chains | Unknown (550+ redirect rules) | 0 chains |
| Orphan pages (indexed but no internal links) | Unknown | 0 |
| Duplicate content pages | ~10 (cannibalisation pairs) | 0 |

### 3.3 Schema Coverage

| Schema Type | Pages With It | Pages That Need It | Gap |
|------------|--------------|-------------------|-----|
| LocalBusiness | 1 (homepage) | 1 | None |
| FAQPage | Some pages | All key pages | Partial |
| Event | Individual event pages | Event type pages too | Missing EventSeries |
| Menu/MenuItem | 0 | 4 (food-menu, pizza, burger, drinks) | Complete gap |
| BreadcrumbList | ~0 (utility exists, not deployed) | All pages | Complete gap |
| Article/BlogPosting | 0 | All blog posts | Complete gap |
| EventVenue/MeetingRoom | 0 | 2 (function-room, corporate) | Complete gap |

---

## 4. Tracking Infrastructure Baselines

### 4.1 Event Volume (Estimated)

| Event Category | Est. Monthly Fires | Confidence |
|---------------|-------------------|------------|
| page_view (GA4 enhanced) | 5,000-8,000 | Medium |
| table_booking_click | 200-400 | Low (no data) |
| table_booking_funnel (any step) | 100-200 | Low (no data) |
| phone_call_click | 50-100 | Low (no data) |
| private_hire_enquiry_submitted | 5-15 | Low (no data) |
| view_event | 200-500 | Low (no data) |
| menu_page_view | 500-1,000 | Low (no data) |
| scroll_depth (homepage only) | 300-600 | Low (no data) |
| cta_click | 100-300 | Low (no data) |

**Note:** All estimates above are based on traffic volume and typical engagement rates. Actual data will be available once GA4 is properly configured with conversion tracking.

### 4.2 Tracking Completeness Score

| Category | Score | Detail |
|----------|-------|--------|
| Conversion tracking | 7/10 | All major conversions tracked, but no traffic source segmentation |
| Engagement tracking | 6/10 | Good on booking forms and menus; scroll depth limited to homepage; many functions unused |
| Error tracking | 4/10 | Function exists but unclear if error boundaries use it |
| Performance tracking | 3/10 | Web vitals collected but /api/web-vitals endpoint missing |
| Attribution tracking | 2/10 | No organic vs direct segmentation, no landing page tracking |
| Reporting infrastructure | 2/10 | No dashboard, no automated reports, no alerting |
| **Overall** | **4/10** | Good event definitions, poor data utilisation |

---

## 5. Baseline Measurement Checklist

Run this checklist at project start, 3 months, and 6 months:

### GSC Metrics (Record Exact Values)
- [ ] Total clicks (28-day)
- [ ] Total impressions (28-day)
- [ ] Average CTR
- [ ] Average position
- [ ] Indexed pages (Coverage report)
- [ ] Rich result impressions (Performance > Search appearance)
- [ ] Pages with errors (Coverage report)
- [ ] Mobile usability issues

### GA4 Metrics (Record Exact Values)
- [ ] Organic sessions
- [ ] Organic users
- [ ] Organic engaged sessions
- [ ] Organic engagement rate
- [ ] Organic conversions (once configured)
- [ ] Organic conversion value (once configured)

### GTM Event Counts (Record from GA4 > Events)
- [ ] table_booking_funnel (total + by step)
- [ ] private_hire_enquiry_submitted
- [ ] phone_call_click
- [ ] email_click
- [ ] menu_page_view (by type)

### Technical (Record from PageSpeed Insights / CrUX)
- [ ] LCP (mobile)
- [ ] CLS (mobile)
- [ ] INP (mobile)
- [ ] LCP (desktop)
- [ ] CLS (desktop)
- [ ] INP (desktop)

### External Presence (Manual Check)
- [ ] Google Business Profile: number of reviews, average rating
- [ ] TripAdvisor: number of reviews, ranking in area
- [ ] Number of venue aggregator listings
- [ ] Number of local directory citations

---

## 6. Target Setting Rationale

### Why +61% clicks in 3 months is realistic

The 3-month target of 1,000 clicks/month (from 622) is based on:

1. **CTR improvement alone = +156 clicks/month** (Section 3.1 of the Analytics Report). Six pages with 6,146 combined impressions improving from avg 0.7% to avg 3.2% CTR.
2. **Schema fixes = +50 clicks/month** from rich result appearance (EventSeries, Menu, Breadcrumbs).
3. **Internal linking = +30 clicks/month** from homepage CTA additions driving more page discovery.
4. **Content pruning = +20 clicks/month** from improved crawl efficiency concentrating authority.
5. **Cannibalisation fixes = +20 clicks/month** from /food-menu vs /sunday-lunch resolution.

Total estimated gain: +276 clicks/month. Target of +378 includes a conservative buffer for compounding effects and impression growth.

### Why 4.0% CTR in 6 months is achievable

- Industry average CTR for position 3 is 5-7% (desktop) and 3-5% (mobile)
- The Anchor's current 1.6% CTR with avg position 13 (mobile) is significantly below expected
- The gap is primarily caused by poor title tags, not poor rankings
- Comparable local business sites with optimised metadata achieve 3-5% CTR
- 4.0% target is conservative for a site that will have positions 3-8 on most target queries

---

## 7. Measurement Dependencies

These must be completed before accurate measurement is possible:

| Dependency | Blocks | Owner | ETA |
|-----------|--------|-------|-----|
| Create /api/web-vitals endpoint | Core Web Vitals baseline | Technical SEO | Week 1 |
| Add traffic source to conversion events | Organic conversion attribution | Analytics | Week 1 |
| Configure GA4 conversions | Revenue page conversion rates | Analytics | Week 1 |
| Assign conversion values in GA4 | ROI calculation | Analytics + Pub manager | Week 2 |
| Build Looker Studio dashboard | Automated reporting | Analytics | Week 3 |
| Set up rank tracking tool | Keyword position monitoring | Analytics | Week 2 |
