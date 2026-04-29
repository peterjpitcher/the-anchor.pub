# `/sunday-lunch` — Recommendations to Review

**Date:** 2026-04-29  
**Goal:** Maximum Sunday roast bookings.  
**Sources merged:** SEO Powerhouse (Technical, Content, Analytics) + page UX/readability audit + conversion ideation per your prompt.

---

## TL;DR diagnosis

The rewritten `/sunday-lunch` page targets the right keyword cluster and has the right skeleton (H1, FAQ, menu, reviews, local section). But three commercial-impact problems land on top of each other and need fixing before 17 May:

1. **The rewrite quietly dropped the Restaurant/Reservation/Breadcrumb schema** that the live page currently has. That's a rich-result regression that will visibly hurt local pack and "near me" rankings.
2. **The booking form has zero funnel tracking.** After 17 May you literally cannot answer "did the new page drive bookings?" — the data simply isn't being collected.
3. **The page actively rejects the carvery cluster** (50K/mo, +900% YoY) instead of capturing it. One sentence in "From the Kitchen" tells a 50K-per-month searcher to leave.

Plus the readability problem you raised is real — every section is wrapped in `max-w-3xl` with multi-paragraph prose, no images below the fold, no comparison tables, no callouts. That IS the "blocky" feel.

Below are 23 recommendations grouped into three tiers. Pick what to ship; I'll convert the chosen items into an implementation plan.

---

## TIER 1 — Ship before 17 May launch (deploy-critical)

### 1. Restore the Restaurant + Reservation + BreadcrumbList JSON-LD ⚠️ regression
**Type:** Schema | **Effort:** S (1 hr)
**Issue:** The branch only emits `FAQPage` + `Menu` JSON-LD. The current production page emits 25 `@type` values including `Restaurant`, `BreadcrumbList`, `Place`, `OpeningHoursSpecification`, `FoodEstablishmentReservation`, `ReserveAction`, `Offer`, geo, areaServed, `priceRange:"££"`, `servesCuisine:["British","Sunday Lunch"]`. The rewrite emits ~5.
**Action:** Re-add Restaurant (with `@id` graph link to `https://www.the-anchor.pub/#business`), BreadcrumbList (use the existing `generateBreadcrumbSchema` helper from `lib/enhanced-schemas.ts`), `FoodEstablishmentReservation` + `ReserveAction`. **Don't** re-add `aggregateRating` from the in-page reviews — that's self-serving review schema; let GBP supply ratings.
**Impact:** High — restores rich-result eligibility for Restaurant + Reserve action + opening hours.

### 2. Fix the booking funnel tracking ⚠️ commercial baseline
**Type:** Analytics | **Effort:** S (1-2 hrs)
**Issue:** `ManagementTableBookingForm.tsx` only fires `trackTableBookingClick`. It never fires `view`/`start`/`submit`/`success`/`error` funnel events. After 17 May, GA4 cannot tie any booking back to `/sunday-lunch` source.
**Action:** Wire the existing `trackTableBookingFunnel` calls (legacy `TableBookingForm.tsx` has the pattern). Also fire a GA4 `purchase`-shaped event on success with `transaction_id = bookingReference`. Propagate `?source=sunday_lunch_hero` from `BookTableButton` so the form knows which page sent the user.
**Impact:** Critical for measuring the launch.

### 3. Track the LaunchAnnouncement banner ⚠️ pre/post launch comparison
**Type:** Analytics | **Effort:** S (30 min)
**Issue:** The banner's three-state lifecycle (pre-launch / launch-day / hidden) flips at 17 May 00:00 BST and 18:00 BST. None of those events are tracked.
**Action:** In `LaunchAnnouncementClient`, fire `trackBannerEvent({id:'sunday_walk_in_launch', action:'view', campaign:'walk_in_launch_2026', label: state})` on first visible render and on every state transition.
**Impact:** Required for "did the banner drive clicks?" analysis post-launch.

### 4. Mount engagement trackers on the page
**Type:** Analytics | **Effort:** XS (15 min)
**Issue:** `/sunday-lunch` doesn't render `ScrollDepthTracker` (the homepage does, via `DeferredHomepageTrackers`) or `MenuPageTracker` (which exists and accepts `menuType="sunday_lunch"`).
**Action:** Render both on the page.
**Impact:** Enables scroll-depth + dwell-time signal for the most commercially important page.

### 5. Fix the H1 — keep "Lunch" in the headline
**Type:** Content / SEO | **Effort:** XS
**Issue:** Branch H1 is "Sunday Roast Near Heathrow". The keyword plan has both `sunday roast` and `sunday lunch` as 50K/mo primaries. Live page currently uses both lexemes; the rewrite drops "Lunch".
**Action:** Change H1 to "Sunday Roast & Lunch Near Heathrow" (or "Sunday Roast Near Heathrow — Sunday Lunch Stanwell Moor"). Same change to `metadata.title`.
**Impact:** Recovers `sunday lunch near me` SERP coverage with no new content needed.

### 6. Capture the carvery cluster — STOP rejecting it
**Type:** Content / SEO | **Effort:** S (1 hr)
**Issue:** The "From the Kitchen" closing sentence ("we don't do a carvery — heat lamps and self-serve trays don't do this kind of cooking justice") reads as a dismissal. There's a "Sunday Roast vs Carvery" subsection but its three paragraphs don't have a `<h2>` or comparison structure that ranks.
**Action:** Replace dismissal with a proper `<h2>Sunday Roast or Carvery? What to Expect Near Heathrow</h2>` section containing a 2-column comparison table (serving style, freshness, queue/wait, price, kid-friendly, dietary). Add a FAQ entry "Is The Anchor a carvery?" so the FAQ schema captures the term.
**Impact:** This is the surprise 50K/mo opportunity. Currently we're telling that traffic to leave.

### 7. Sticky mobile booking CTA bar 📱 conversion-critical
**Type:** Mobile UX / Conversion | **Effort:** S (1-2 hrs)
**Issue:** On mobile, the hero "Book a Table" button scrolls away within seconds. Visitors reading reviews / menu / FAQ have no visible CTA until they reach the final green section. That's the biggest conversion leak.
**Action:** Add a sticky bottom bar that appears after scroll-down ~150px and shows "Book a Sunday roast" + phone icon. Hide on `lg:` (desktop has the hero CTA still in visual reach with smarter scroll).
**Impact:** Industry-standard pattern; expect 10-25% lift on mobile booking CTR.

---

## TIER 2 — Ship within 2 weeks (high-value, medium effort)

### 8. Trust strip under the H1
**Type:** Conversion | **Effort:** XS
**Issue:** No social-proof / trust signals visible above the fold beyond the price.
**Action:** Add a 3-4 icon strip immediately under the lead paragraph: "🐶 Dog friendly · 🅿️ Free parking · 🚶 Walk-in welcome · ⭐ 4.6/5 on Google". Builds trust before the user has to scroll.
**Impact:** Increases hero engagement; reinforces multiple keyword angles (dog-friendly: 500/mo).

### 8a. Sub-headed local mini-blocks
**Type:** Content / SEO | **Effort:** S
**Issue:** Local section is one large `<p>` covering Surrey + Ashford + west London + Stanwell + Egham + Wraysbury + Bedfont. Each location currently appears once. Low keyword density per locality.
**Action:** Split into `<h3>From Surrey</h3>` / `<h3>From Ashford & Staines</h3>` / `<h3>From West London</h3>` mini-blocks, each with: 2-line directions/distance + a regular's micro-quote or postcode coverage list.
**Impact:** Captures the 6 local SEO terms more strongly + adds scan-points (kills the "blocky" feel).

### 9. Restructure "From the Kitchen" — 2-column with bullets
**Type:** Readability | **Effort:** S
**Issue:** Three back-to-back `<p className="leading-relaxed">` paragraphs is the textbook "blocky" pattern.
**Action:** 2-column layout on `lg:` — left = 4-6 short bullets ("Beef topside, slow-roasted to medium-rare", "Yorkshires baked to order, never reheated", "Triple-cooked roasties in beef dripping", "Gravy from the pan, finished with red wine"); right = an actual photo of a plated roast. Mobile stacks to single column.
**Impact:** Same words, but scannable. Adds image-pack-friendly photo. Readability.

### 10. Convert "vs carvery" from prose to a 6-row comparison table
**Type:** Readability + SEO | **Effort:** S
**Issue:** Three paragraphs that say the same thing three ways. Comparison tables both rank well (rich-result eligible) and read fast.
**Action:** | Row | Carvery | The Anchor's Sunday roast |
Rows: Serving style, Meat carved, Yorkshire pudding, Roast potatoes, Vegetarian option, Best for. Keep the differentiation but in scannable form.
**Impact:** Captures `carvery vs sunday roast` searchers; kills another wall of prose.

### 11. Add vegan/vegetarian capture
**Type:** Content / SEO | **Effort:** XS
**Issue:** `vegan sunday roast` is a 5K/mo keyword. The page has the wellington on the menu but no `<h3>`, no FAQ, no inline mention.
**Action:** Add `<h3>Vegan & Vegetarian Sunday Roast</h3>` callout under "What's on the Plate" + FAQ entry "Do you serve a vegan or vegetarian Sunday roast?" (already partial — lift visibility).
**Impact:** Niche but strong intent; FAQ schema adds rich result.

### 12. Add Sunday dinner FAQ + lead phrase
**Type:** Content / SEO | **Effort:** XS
**Issue:** `sunday dinner near me` is a 50K/mo primary. The word "dinner" appears nowhere on the page.
**Action:** Add FAQ "Is Sunday dinner the same as Sunday lunch at The Anchor?" (yes — served 1pm-6pm, works as late lunch or early dinner). Add "Sunday lunch or Sunday dinner" once in the lead paragraph.
**Impact:** Captures a 50K-vol cluster the page is currently invisible to.

### 13. 301 redirect the cannibalising blog post
**Type:** SEO | **Effort:** XS (config change)
**Issue:** `/blog/sunday-lunch-at-the-anchor-is-back-pre-order-now` has the title "Sunday Lunch Near Heathrow | Traditional Roasts at The Anchor" — direct duplicate of the pillar's intent. The URL slug literally says "pre-order" which contradicts the new walk-in model.
**Action:** Add a permanent 301 from this slug to `/sunday-lunch` in `next.config.js` redirects.
**Impact:** Consolidates link equity into the pillar; ends the cannibalisation.

### 14. Cloudflare robots.txt — unblock AI search crawlers
**Type:** SEO / AI search | **Effort:** XS (Cloudflare dashboard)
**Issue:** Live `/robots.txt` is Cloudflare-managed and disallows ClaudeBot, GPTBot, Google-Extended, Applebot-Extended, CCBot, Bytespider, Amazonbot. Zero AI search visibility.
**Action:** In Cloudflare → Bot Management → AI Audit → either disable the managed rule, or explicitly allow the search-only bots (`OAI-SearchBot`, `PerplexityBot`, `Applebot-Extended`, `Google-Extended`) while keeping training-only bots blocked.
**Impact:** Restores presence in ChatGPT Search / Perplexity / Apple Intelligence — growing referral channels for "near me" intent. **Operational change — not a code change.**

### 15. Section above reviews — "Why locals rate it"
**Type:** Content / SEO | **Effort:** XS
**Issue:** Reviews grid heading is "What Guests Say About Sunday Roast at The Anchor". Plan has "best sunday roast" as a primary keyword (5K/mo). Word "best" appears nowhere in any heading.
**Action:** Change section heading to `<h2>Why Locals Rate It One of the Best Sunday Roasts Near Heathrow</h2>`. Reviews then visually answer "best?" without making a self-serving review-schema claim.
**Impact:** Captures `best sunday roast` cluster; uses social proof to justify the claim.

### 16. Carvery FAQ entry
**Type:** Content / SEO | **Effort:** XS
**Issue:** No FAQ for "Is The Anchor a carvery?" — leaves the FAQ schema's carvery capture untapped.
**Action:** Add 8th FAQ. (Wording in #6 above.)
**Impact:** FAQ rich result for carvery searchers.

### 17. Track the inline phone link
**Type:** Analytics | **Effort:** XS
**Issue:** The "How Sundays Work" bullet at line 332 has a raw `<a href="tel:...">` not wrapped in `PhoneLink`. Phone calls from this CTA are untracked.
**Action:** Replace with `PhoneLink` (or similar tracked component) firing `trackPhoneCallClick({contact_source:'sunday_lunch_inline'})`.
**Impact:** Counts otherwise-invisible phone-call conversions.

### 18. Section view + inline CTA on the carvery section
**Type:** Analytics + Conversion | **Effort:** S
**Issue:** Carvery section has no engagement tracking and no inline CTA. If it ranks but doesn't convert, you can't tell which lever to pull.
**Action:** Wrap in IntersectionObserver firing `section_view` once at 50% visibility. Add an inline `BookTableButton source="sunday_lunch_carvery"` at the end of the section.
**Impact:** Funnel measurement for the 50K/mo opportunity + a CTA where the user is most engaged with comparison content.

---

## TIER 3 — Polish & longer plays (post-launch)

### 19. Diagnose the ISR cache miss
**Type:** Performance | **Effort:** M
**Issue:** Live response shows `cache-control: no-cache, no-store` despite `revalidate = 3600`. Probably the LaunchAnnouncement reading `Date.now()` server-side opts the route out of caching. Every request pays full TTFB.
**Action:** Move time-dependent UI fully into Client Components or wrap with `unstable_cache`. Confirm post-fix headers show `s-maxage=3600` + `x-vercel-cache: HIT`.
**Impact:** Big LCP/TTFB improvement; better Core Web Vitals; Cloudflare can cache.

### 20. 2-3 below-fold images
**Type:** Readability + SEO | **Effort:** S
**Issue:** Only the hero image is shown. 9 H2s, 11 H3s, all text.
**Action:** Add interior shot, beer-garden shot, plated roast variant. Lazy load, explicit width/height (no CLS), `sizes="(min-width:768px) 720px, 100vw"`. Below-fold image budget < 250 KB.
**Impact:** Visual rhythm; image-pack ranking; engagement.

### 21. Menu-item lightbox / detail modal
**Type:** Conversion | **Effort:** M
**Issue:** Menu items are static rows. Tapping a roast on mobile does nothing.
**Action:** Make each menu item open a lightbox showing a photo + larger description + a "Pre-select this roast and book" CTA that deep-links to `/book-table?roast=beef` (the booking flow doesn't currently use the param but could be wired later).
**Impact:** Engagement + a softer-friction booking path.

### 22. Per-item menu engagement events
**Type:** Analytics | **Effort:** S
**Issue:** Can't tell which roast generates the most interest.
**Action:** Per-item click/hover handlers firing `trackViewItem({category:'menu_item', name})`.
**Impact:** Kitchen-prep insight; future A/B test fodder.

### 23. Inbound anchor-text variation audit
**Type:** SEO | **Effort:** S
**Issue:** 25 internal pages link to `/sunday-lunch`. Anchor text is generic ("Sunday lunch menu", "Sunday Lunch") — no exact-match like "Sunday roast near Heathrow".
**Action:** Audit top 10 inbound links across `Footer`, `Navigation`, terminal pages, easter/fathers-day. Standardise on three rotating phrases: "Sunday roast near Heathrow", "book a Sunday roast", "our Sunday roast menu". Terminal pages anchor with location-aware text.
**Impact:** Compounding keyword reinforcement.

---

## Conversion-driving ideas you asked about (lightboxes / sticky menus / etc.)

Already folded into the recommendations:
- **Sticky mobile booking CTA** — Tier 1 #7
- **Trust strip above fold** — Tier 2 #8
- **Comparison table for vs-carvery** — Tier 2 #10
- **Menu-item lightbox** — Tier 3 #21
- **Inline CTA after the carvery section** — Tier 2 #18 (best-engaged-with-comparison-content moment)

Worth considering separately (didn't include in tiers — your call):
- **"Choose your roast" pre-selector** that prefills `/book-table` with the user's pick. Adds friction-reduction at the most important conversion moment. Effort M (needs both repos).
- **Scroll-progress-triggered tooltip** — at 70% scroll, surface a small tooltip "Ready to book? Sunday lunch books out fast." Effort XS.
- **Exit-intent modal on desktop** — on mouse-leave-toward-tab-close, show a "Don't lose your spot" modal with a Book CTA. Effort S. Often resented; only worth it if A/B test confirms lift.
- **Plan-your-visit micro-itinerary** for Heathrow travellers — "Land at T5 → 7 min drive → Sunday roast → catch your evening flight". Effort S. Captures the existing audience + adds a conversion narrative.

---

## How I suggest you respond

Pick from these tiers what to ship. Three reasonable paths:

- **Path A (lean launch):** Tier 1 only (#1-7) before 17 May. Tier 2 + 3 after.
- **Path B (recommended):** Tier 1 + Tier 2 #8, #9, #10, #14, #18 before 17 May. Rest after.
- **Path C (max push):** Everything in Tier 1 and 2 before 17 May. Tier 3 + extra ideas as a follow-up sprint.

Once you pick, I'll convert the chosen items into an implementation plan and dispatch a final agent wave to ship them.
