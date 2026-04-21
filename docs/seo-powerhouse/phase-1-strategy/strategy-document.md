# SEO Strategy Document — The Anchor, Stanwell Moor

**Date:** 21 April 2026 | **Author:** SEO Strategy Lead
**Version:** 1.0 — Foundation strategy for SEO Powerhouse engagement

---

## Strategic Position

The Anchor is a low-DA, high-relevance local site that has demonstrated it can win on content depth for niche queries. The plane spotting cluster (~430 clicks/month) proves the model: go deep on a specific topic, rank against low-competition queries, convert through internal linking.

The site is growing fast (+60% daily clicks, +24% impressions in 28 days) but the growth is in the wrong channel. Plane spotting is a hobby interest, not a buyer signal. The commercial priorities — food bookings, private hire, hosted events — are barely visible in search.

**The strategic challenge is not traffic volume. It is traffic quality and intent alignment.**

---

## Where We Can Realistically Win

### High-confidence wins (achievable <3 months)

**Thin-margin ranking improvements via CTR fixes:**
The site has pages at positions 4–11 with terrible CTRs. These are ranking failures caused by bad meta titles and descriptions, not content failures. Fixing them costs near-zero effort and unlocks existing impression inventory.

- /whats-on: pos 4.45, 0.73% CTR → should be 6–8% at that position. Fix title = ~40 extra clicks/month.
- /karaoke: pos 9.31, 0% CTR → broken title. Fix = recover ~5–10 clicks/month.
- /book-table: pos 10.56, 0.57% CTR → fix title + internal links = push to top 10.

**Hyper-local private hire pages:**
The /private-hire/near/slough-crematorium page has a 5.98% CTR at position 12.3 — the highest CTR in the P2 cluster. This is the proof that hyper-specific geo+occasion pages work. Three more slugs (Staines, Ashford, Windsor) could double P2 traffic within 90 days.

**Plane spotting → booking conversion:**
No new SEO work needed. Just add contextual CTAs to 3 existing blog posts. These visitors are already in the Heathrow area — the pub is 5 minutes away. This is the fastest path to incremental table bookings.

### Achievable wins (3–6 months)

**Sunday roast near Heathrow — position 5 or better:**
Currently at ~position 10. Deserves a top-5 position. Requires: meta rewrite, structured data (Restaurant + Menu schema), and 2–3 internal links from Heathrow-context pages. No new content required.

**Wakes — position 10 or better:**
Currently at position 25. Requires a full content expansion of /private-hire/wakes. This is a high-intent, low-competition query in a geography underserved by specialist funeral reception venues. A well-written page covering capacity, catering, private access, and crematorium proximity should rank top-10.

**Quiz night / hosted events — position 5 or better:**
Event schema + meta fixes. Currently at positions 8–11 with no Event rich result exposure.

### Aspirational (6–12 months, DA-dependent)

**"Pub near Heathrow" — top 5:**
Dominated by hotel bars and aggregators. The terminal-specific pages (/near-heathrow/terminal-5 etc.) are the better angle — less competition, more specific intent.

**"Restaurants near Heathrow" — top 5:**
TripAdvisor, Yelp, Google Local will hold top 3. Position 4–6 is realistic with aggregateRating schema and content depth, but requires GBP review growth.

**"Function room hire Heathrow" — top 3:**
Achievable but requires sustained content investment and potentially backlink acquisition from local event directories.

---

## Critique of Existing Plan

The plan at `docs/superpowers/plans/2026-04-21-gsc-performance-enhancement-plan.md` is technically correct but has five weaknesses:

**1. It buries the most critical issue.**
The CSS files blocked by robots.txt (specced in `docs/gsc-coverage-fix-spec.md`) is not in the existing plan at all. Googlebot cannot render pages properly. This affects rich result eligibility for every schema enhancement in Phase 3. This must be phase 0, not an afterthought.

**2. The content strategy is defensive, not growth-oriented.**
Phase 4 is mainly "cross-linking" fixes. There is no plan to create new pages to capture unaddressed intent. The /private-hire/near/[slug] pattern is the highest-CTR page in P2 — the plan doesn't mention expanding it.

**3. The plane spotting → booking conversion opportunity is undersold.**
Listed as item 7 in priority ranking with "High" impact. It should be item 1 or 2. It requires zero new content, touches existing high-traffic pages, and directly serves the P1 business priority. The effort/impact ratio is the best on the list.

**4. Brand query fix (5.1) is too shallow.**
"The anchor pub" at position 7.5 losing to other Anchors is a significant commercial problem. The fix requires more than adding "Stanwell Moor" to the title — it needs GBP optimisation, `sameAs` schema, and potentially disambiguation content on the homepage.

**5. No mention of the conversion funnel from search to booking.**
The plan measures success in "clicks" and "impressions." A click to /book-table that doesn't convert is worth nothing. The plan needs a CRO element: are the landing pages optimised to convert the search traffic the SEO work will generate? This is particularly critical for /private-hire/wakes and /book-table.

---

## Strategic Framework

### The Three-Layer Model

```
Layer 1 — Technical Foundation (unblock rendering, fix indexing)
    ↓
Layer 2 — Intent Alignment (CTR fixes, meta rewrites, schema)
    ↓
Layer 3 — Traffic Conversion (CTAs, booking UX, new page creation)
```

The existing plan focuses mainly on Layer 2. Layer 1 is partially addressed. Layer 3 is missing almost entirely.

### The Specificity Principle

Every page should answer a question no other page on the internet answers as well. Generic pages lose to aggregators. Specific pages — "wake venue 5 minutes from Slough Crematorium" — win because no TripAdvisor category exists for that.

### The Intent-Revenue Bridge

The site needs an explicit policy: every informational page must link to a transactional one. Plane spotting → book a table. Beer garden → summer garden parties. Live sport → book for the match. This is not just internal linking — it is demand capture.

---

## Direction for Each Specialist

### Technical SEO
**Priority 1:** Fix CSS robots.txt blocking (docs/gsc-coverage-fix-spec.md is the spec — implement it).
**Priority 2:** Commit deleted test pages + clean robots.ts disallow list.
**Priority 3:** Update STATIC_LAST_MODIFIED in sitemap.ts to 2026-04-21.
**Priority 4:** Audit 4 redirect chains on Euro 2024 blog posts — fix or remove.
**Avoid:** Chasing the 9 "crawled but not indexed" URLs without first understanding whether Google is making a quality judgement vs a technical block.

### Content Strategy
**Priority 1:** Plane spotting blog posts — add 3 booking CTAs (no new content needed).
**Priority 2:** Expand /private-hire/wakes to 800+ words covering capacity, catering, crematorium proximity, booking process.
**Priority 3:** Create 3 new /private-hire/near/ slugs (Staines, Ashford, Windsor or nearest cemetery/crematorium).
**Priority 4:** Build a content brief for a "book a table near Heathrow" landing page.
**Avoid:** Creating thin seasonal content (Easter, Halloween etc.) unless The Anchor is confirmed to be running specific events.

### Analytics
**Priority 1:** Set up conversion tracking: what % of /book-table visitors complete a booking? Without this, all SEO work is unmeasured.
**Priority 2:** Track assisted conversions — plane spotting → food pages → book-table paths in GA4.
**Priority 3:** Create a GSC dashboard segmented by business priority (P1/P2/P3 query groups).
**Avoid:** Optimising for impressions or rankings without tying to booking completions.

### Authority / Link Building
**Priority 1:** Local directories: Staines, Spelthorne, Surrey pub/restaurant directories.
**Priority 2:** Plane spotting community links — the existing blog content merits links from aviation enthusiast sites. Active outreach could move plane spotting pages from position 7–8 to 3–5.
**Priority 3:** Crematorium / funeral director proximity mentions — local funeral services often list nearby reception venues.
**Avoid:** Generic link-building services — they won't deliver geo-relevant authority.

### UX / CRO
**Priority 1:** /book-table wizard — is the completion rate tracked? The page has 174 impressions and a poor CTR, but even fixing CTR is wasted if the wizard has high abandonment.
**Priority 2:** /private-hire/wakes — ensure the page has a clear, empathetic CTA ("Call us to discuss your requirements") not just a generic booking form.
**Priority 3:** Plane spotting pages — what does the content-to-CTA conversion funnel look like? Add heatmap tracking.

### Copywriter
**Priority 1 (immediate):** Rewrite meta titles and descriptions for: /whats-on, /karaoke, /book-table, /sunday-lunch, /private-hire/wakes, /stanwell-pub.
**Priority 2:** Expand /private-hire/wakes body copy with empathy-led, factual content.
**Priority 3:** Write booking CTA copy blocks for plane spotting blog posts.
**Rules:** All copy must reference SSOT.json for verified facts. No seasonal content unless confirmed. "The Anchor Pub" for SEO contexts; "The Anchor" for conversational mentions.

---

## 90-Day Success Metrics

| Metric | Current | 90-Day Target |
|--------|---------|---------------|
| Daily clicks | 44.3 | 65+ |
| P1 food booking clicks | ~67/28d | 130+/28d |
| P2 private hire clicks | ~1/28d | 15+/28d |
| P3 hosted events clicks | ~12/28d | 25+/28d |
| /whats-on CTR | 0.73% | 5%+ |
| /private-hire/wakes position | 25.58 | <12 |
| /book-table position | 10.56 | <8 |
| CSS blocked by robots.txt | ~99 URLs | 0 |
