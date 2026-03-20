# On-Page SEO Audit: the-anchor.pub

**Audit date:** 2026-03-20
**Auditor:** On-Page SEO Specialist
**Scope:** Priority revenue pages -- food, events, private hire, key landing pages

---

## Executive Summary

The site has strong technical SEO foundations: canonical URLs are correctly set per-page, structured data (JSON-LD) is extensive, and content depth on priority pages is generally good. However, several high-impact issues are limiting organic performance:

1. **Root layout title is keyword-stuffed** and hurts any page that falls back to it.
2. **Title tags on underperforming pages lack CTR hooks** (no pricing, no urgency, no clear benefit).
3. **Keyword cannibalisation** between /near-heathrow, /restaurants-near-heathrow, and the homepage for "pubs near heathrow" variants.
4. **/quiz-night and /drinks have very low CTR despite hundreds of impressions**, largely due to weak meta descriptions and titles that do not match user intent.
5. **Private hire cluster** (/private-hire, /function-room-hire, /corporate-events) has poor titles for local search and no cross-linking between the three.
6. **Homepage links to food-menu and beer-garden but not to /sunday-lunch or /drinks directly**, starving two revenue pages of PageRank.

---

## 1. Title Tag Audit

### Impact: CRITICAL

| Page | Current Title | Char | Issues | Recommended Title |
|------|--------------|------|--------|-------------------|
| **Root layout default** | `Traditional Bar Near Me \| The Anchor - Heathrow Pub & Dining \| Surrey Bar Near Heathrow` | 84 | Keyword-stuffed. "Bar near me" is not how users search for a pub. "Surrey Bar" is awkward. Exceeds 60-char display limit. Any page without its own title inherits this. | `The Anchor \| Pub Near Heathrow \| Stanwell Moor` (49 chars) |
| **Root layout template** | `%s \| The Anchor - Heathrow Pub & Dining` | 41 suffix | Reasonable but long suffix eats into page-specific keywords. | `%s \| The Anchor Stanwell Moor` (30 suffix, gives pages more room) |
| **Homepage** | `The Anchor \| Pub Near Heathrow Airport \| Free Parking & Dog Friendly \| Stanwell Moor` | 87 | Too long -- Google will truncate after ~60 chars. The "Free Parking & Dog Friendly" part gets cut. | `The Anchor Stanwell Moor \| Pub Near Heathrow \| Free Parking` (61 chars) |
| **/food-menu** | `Pub Food Menu Near Heathrow \| Sunday Roast, Pizza & Fish & Chips \| The Anchor` | 79 | Good keyword targeting but truncated in SERPs. Position 8.6 with 1% CTR suggests title is not compelling enough. | `Food Menu \| Pub Near Heathrow from £10 \| The Anchor` (53 chars -- adds price hook) |
| **/sunday-lunch** | `Sunday Roast Near Heathrow \| From £19.99 \| Book by Saturday 1pm \| The Anchor` | 78 | Strong CTR hooks (price, urgency). But 78 chars means "The Anchor" gets cut. Position 7.3 with only 1.2% CTR despite 774 impressions -- likely a display issue. | `Sunday Roast Near Heathrow from £19.99 \| Book by Sat 1pm` (58 chars -- brand in template suffix) |
| **/book-table** | `Book a Table Online \| The Anchor - Heathrow Pub & Dining` | 57 | Generic. No location signal. No urgency. Position 9.6. | `Book a Table \| The Anchor Stanwell Moor \| Instant Confirmation` (63 chars) |
| **/private-hire** | `Private Hire Venue Near Heathrow \| The Anchor Stanwell Moor` | 60 | Decent but misses "function room" and "event venue" variants. Only 1 click / 100 imp. | `Private Event Venue Near Heathrow \| 10-200 Guests \| Free Parking` (65 chars) |
| **/quiz-night** | `Quiz Night Pub Near Heathrow \| The Anchor Trivia Night` | 55 | 1 click / 431 imp / 0.2% CTR. Title does not differentiate. Missing day, price, or prize hook. | `Quiz Night Wednesdays \| £3 Entry, £25 Prize \| Pub Near Heathrow` (64 chars) |
| **/music-bingo** | `Music Bingo Near Heathrow \| Singalong Bingo Night \| The Anchor` | 63 | Solid keyword match. Reasonable. | Keep or shorten to: `Music Bingo Near Heathrow \| Prizes Every Round \| The Anchor` (60 chars) |
| **/karaoke** | `Karaoke Nights Near Heathrow \| Sing Out at The Anchor` | 54 | Fine length. "Sing Out" is weak. | `Free Karaoke Night Near Heathrow \| Thousands of Songs \| The Anchor` (66 chars -- "Free" is a strong CTR word) |
| **/beer-garden** | `Dog-Friendly Beer Garden Near Heathrow \| Watch Planes Every 90 Secs \| The Anchor` | 81 | Very long but the USP (planes every 90 secs) is highly clickable. Position 7.1 with 2.8% CTR is decent. Truncation loses "The Anchor". | `Beer Garden Near Heathrow \| Planes Every 90 Secs \| Dog Friendly` (64 chars) |
| **/near-heathrow** | `Closest Pub to Heathrow Airport \| 7 Mins from Terminal 5 \| Free Parking \| The Anchor` | 85 | 4 pipe separators. Severely truncated. 0.7% CTR on 1762 impressions is poor. | `Closest Pub to Heathrow Airport \| 7 Mins from T5 \| Free Parking` (65 chars) |
| **/drinks** | `Drinks Menu Near Heathrow T5 & Staines \| Beers, Cocktails & Shots` | 66 | 0.2% CTR on 551 impressions. "Heathrow T5 & Staines" is clunky. No brand. | `Drinks Menu \| Craft Beer, Cocktails & Wine \| The Anchor` (56 chars) |
| **/live-sport** | `Live Sport Pub Near Heathrow \| The Anchor` | 43 | Short and generic. 1.1% CTR on 986 imp. Missing sport types. | `Live Sport on Big Screens \| Rugby, F1 & Football \| Pub Near Heathrow` (69 chars) |
| **/corporate-events** | `Heathrow Corporate Event Venue - Meeting Rooms with Parking \| The Anchor` | 73 | 0.3% CTR on 344 imp at position 26. Using hyphens instead of pipes inconsistently. | `Corporate Event Venue Near Heathrow \| Free Parking \| From 10 Guests` (68 chars) |
| **/function-room-hire** | `Function Room Hire Near Heathrow & Staines \| The Anchor` | 56 | 0.8% CTR on 249 imp at position 24.7. Decent keyword match but no differentiator. | `Function Room Hire Staines & Heathrow \| 10-200 Guests \| Free Parking` (69 chars) |
| **/restaurants-near-heathrow** | `Restaurant Near Heathrow Airport \| The Anchor - Better Than Terminal Dining` | 76 | Good angle but truncated. 0.3% CTR at position 21.4. | `Restaurant Near Heathrow \| Skip Airport Prices \| 7 Mins from T5` (65 chars) |
| **/whats-on** | `What's On at The Anchor (Near Heathrow T5) \| Music Bingo, Quiz & Bingo` | 71 | Truncated. Parentheses waste space. | `What's On \| Quiz Night, Music Bingo & Events \| Near Heathrow T5` (64 chars) |
| **/find-us** | `Directions to The Anchor (TW19 6AQ) \| Free Parking \| Near Heathrow T5` | 71 | Good transactional intent matching. Slightly long. | `Find Us \| The Anchor TW19 6AQ \| 7 Mins from Heathrow T5` (57 chars) |
| **/heathrow-parking** | `Cheap Heathrow Parking from £15/day \| 7 mins to T5 \| The Anchor` | 64 | Strong. Price hook and proximity. Keep. | No change needed. |

**Key pattern:** Most titles exceed 60 characters and get truncated, hiding the brand name and USP from searchers.

---

## 2. Meta Description Audit

### Impact: HIGH

| Page | Description Quality | Issues |
|------|-------------------|--------|
| **/food-menu** | Good -- has price (£19.99), proximity (7 mins), CTA (book a table). | 156 chars, within limit. |
| **/sunday-lunch** | Strong -- price, options, proximity, CTA. | Good. |
| **/quiz-night** | "Join The Anchor's quiz night pub near Heathrow for a monthly trivia night with a £25 bar tab prize, £3 entry..." | Good hooks but opens weakly with "Join The Anchor's" -- should lead with the benefit. |
| **/book-table** | "Book your table at The Anchor online with fast confirmation via our management platform." | "via our management platform" is internal jargon. Replace with benefit language. |
| **/private-hire** | "The Anchor is a premier private hire venue..." | "Premier" is empty marketing speak. Should mention capacity (10-200), free parking, and proximity. |
| **/drinks** | Solid. Mentions locations (Stanwell Moor, Heathrow T5, Staines). | Missing a CTA. |
| **/live-sport** | Uses template literal with BRAND.name -- good. | Missing specific sports (no Sky Sports disclaimer not reflected). |
| **/corporate-events** | Covers meeting rooms, AV, free parking. | Missing guest capacity range. |
| **/function-room-hire** | Good -- 10-200 guests, free parking, catering. | Could add a price indicator ("from £X pp"). |
| **/near-heathrow** | Strong -- terminal distances, free parking, dog-friendly. | 200+ chars -- will be truncated. Trim to 155. |
| **/beer-garden** | Excellent -- 64-seat, planes, heated areas, free parking. | Good. |
| **/karaoke** | "Join the best karaoke night..." -- "best" is a hollow claim. | Lead with "Free entry" since that is the USP. |

---

## 3. Heading Structure Audit

### Impact: HIGH

| Page | H1 | Issues |
|------|-----|--------|
| **Homepage** | `The Anchor - Stanwell Moor's Favourite Local Pub` (via PageTitle component) | Good. But the HeroWrapper also renders a visual "title" -- check it is not also an H1. |
| **/food-menu** | HeroWrapper title: "Book Pub Food Minutes from Heathrow" + PageTitle via SectionHeader "Proper British Pub Food at The Anchor" | Potential **two H1s**. The HeroWrapper title and the first SectionHeader could both render as H1. The SectionHeader "Full Food Menu & Pub Menu" is a third potential H1. Needs verification of rendered HTML. |
| **/sunday-lunch** | HeroWrapper: "Sunday Lunch at The Anchor" | Clean single H1. Good keyword in H1. |
| **/quiz-night** | PageTitle: "Heathrow Quiz Night Pub & Trivia Night - Stanwell Moor, Staines & Surrey" | Keyword-stuffed H1. Lists three locations. Should be shorter: "Quiz Night at The Anchor, Stanwell Moor". |
| **/music-bingo** | PageTitle: "Music Bingo Near Heathrow - Stanwell Moor, Staines and Surrey" | Same pattern -- location-stuffed. |
| **/karaoke** | PageTitle: "Karaoke Pub Near Heathrow -- Sing Your Way to Stardom" | Better -- single clear topic + location. |
| **/private-hire** | PageTitle: "Your Event, Your Space -- Private Hire at The Anchor" | Good. |
| **/book-table** | PageTitle: "Book Online" | Too generic. Should include "Book a Table at The Anchor" for branded + intent signal. |
| **/beer-garden** | Check rendering -- likely via HeroWrapper. | Need to confirm single H1. |
| **/drinks** | Check rendering via PageTitle. | Need to confirm. |

**H2 hierarchy** is generally well-structured across pages with clear section headers. The food-menu page has the most sections (8+) but they follow a logical information architecture.

---

## 4. Keyword Cannibalisation Analysis

### Impact: HIGH

| Target Query | Competing Pages | Recommendation |
|-------------|----------------|----------------|
| **"pubs near heathrow"** / **"pub near heathrow"** | Homepage (pos 14.7), /near-heathrow (pos 11.7), /beer-garden (pos 7.1) | /near-heathrow should be the primary target. Homepage should target branded queries. /beer-garden targets "beer garden heathrow" specifically. Currently all three dilute authority. Add canonical signals: homepage links to /near-heathrow for "near heathrow" queries. |
| **"sunday roast near me"** / **"sunday lunch near me"** | /sunday-lunch (pos 7.3), /food-menu (has "Sunday Roast" section with H2), /blog/best-sunday-roast-near-heathrow (pos 7) | Three pages compete. /sunday-lunch should be primary. The blog post is a supporting content piece (acceptable). But /food-menu has a full "Sunday Roast and Sunday Lunch Near Heathrow" H2 section that duplicates content -- consider linking to /sunday-lunch instead of duplicating. |
| **"function room hire"** variants | /function-room-hire (pos 24.7), /private-hire (pos 9.6), /corporate-events (pos 26) | Three separate pages targeting overlapping "venue hire" queries. /private-hire is the hub. /function-room-hire and /corporate-events are spokes. Internal links should flow hub-to-spoke clearly. Currently /private-hire links to /corporate-events but not to /function-room-hire in its card grid. |
| **"quiz night near me"** | /quiz-night (pos 8.3), /whats-on (mentions quiz) | Minimal overlap. /quiz-night is correctly the primary page. |
| **"restaurants near heathrow"** | /restaurants-near-heathrow (pos 21.4), /near-heathrow (pos 11.7), /food-menu (pos 8.6) | Three pages. /restaurants-near-heathrow exists specifically for this query but ranks worst. It has no links from the main navigation or homepage. Needs internal link equity. |

---

## 5. Internal Linking Assessment

### Impact: CRITICAL

#### Navigation structure (from Navigation.tsx defaultItems):

| Nav Group | Links Included | Missing High-Priority Pages |
|-----------|---------------|----------------------------|
| What's On | /whats-on, /music-bingo, /quiz-night, /cash-bingo, /karaoke, /live-music, /open-mic, /live-sport | Good coverage |
| Menus | /food-menu, /sunday-lunch, /food-menu#pizza | **Missing /drinks** (drinks has its own nav group) |
| Drinks | /drinks, /drinks/managers-special | Separate from Menus -- fine |
| Events & Hire | /private-hire, /private-party-venue, milestone-birthdays, engagement, gender-reveal, baby-showers, christenings, weddings, wakes, retirement, /corporate-events, /corporate-christmas-parties, /christmas-parties, /function-room-hire | Comprehensive |
| Visit Us | /find-us, /near-heathrow, /heathrow-layover-dining, terminal subpages, /heathrow-hotels-pub, /m25-junction-14-pub, /plane-spotting-heathrow | Good. **Missing /restaurants-near-heathrow** -- a page with 1010 impressions gets zero nav links. |
| Blog | /blog | Fine |

#### Homepage internal links to priority pages:

| Priority Page | Linked from Homepage? | How? |
|--------------|----------------------|------|
| /food-menu | YES | Hero secondary CTA ("View Menu"), gallery image caption |
| /sunday-lunch | WEAK | Mentioned in FAQ text and info section, but no direct CTA button or card link |
| /book-table | YES | Hero primary CTA, multiple BookTableButton components |
| /private-hire | YES | "Explore All Event Options" button |
| /corporate-events | YES | Card in "Host Your Event" section |
| /quiz-night | NO | Not linked from homepage body. Only in nav dropdown. |
| /music-bingo | NO | Not linked from homepage body. Only in nav dropdown. |
| /karaoke | NO | Not linked from homepage body. Only in nav dropdown. |
| /beer-garden | YES | Gallery image link, "Plane Spotting" mention |
| /near-heathrow | YES | "Get Directions From Your Terminal" button |
| /drinks | NO | Not linked from homepage body at all. Only in nav. |
| /live-sport | NO | Not linked from homepage body. Only in nav dropdown. |
| /sunday-lunch | NO direct link | Mentioned as text in FAQ but no card/button |
| /restaurants-near-heathrow | NO | Not linked anywhere from homepage or nav |
| /function-room-hire | NO | Not linked from homepage. Only in nav dropdown. |

**Critical gap:** The homepage's "What's Coming Up" section dynamically loads the next event, but does not persistently link to /quiz-night, /music-bingo, or /karaoke pages. These event pages each have 400-900+ impressions but very low clicks -- partly because they receive minimal internal link equity from the most authoritative page (homepage).

**Critical gap:** /sunday-lunch (Priority 1 revenue page) has no prominent CTA or card on the homepage. It appears only in an FAQ answer and a nav dropdown. Given it has 774 impressions at position 7.3 with only 1.2% CTR, it needs more homepage visibility and link equity.

**Critical gap:** /drinks (551 impressions, 0.2% CTR) has zero links from the homepage body. The food-menu page links to /drinks in its final CTA, but the homepage does not.

---

## 6. Content Depth Assessment

### Impact: MEDIUM to HIGH

| Page | Word Count (est.) | Content Depth | Verdict |
|------|-------------------|---------------|---------|
| **/food-menu** | 1500+ (excluding menu items) | Very deep: intro, menu renderer, sunday roast section, pizza section, pub classics section, dietary section, FAQ (9 questions), schema markup | Excellent |
| **/sunday-lunch** | 800+ | Good: menu items, pre-order flow, FAQ (5 questions), multiple CTAs | Good |
| **/quiz-night** | 2000+ | Extremely deep: event cards, how it runs, prizes, tips, FAQ (9 questions), map | Excellent -- possibly over-optimised with keyword repetition |
| **/music-bingo** | 1500+ | Deep: event cards, how to play, tips, FAQ (8 questions), map | Excellent |
| **/karaoke** | 1000+ | Adequate: event cards, how it works, FAQ (5 questions), map | Good |
| **/private-hire** | 600 | Thin for a hub page. Six event-type cards with 2-line descriptions, a booking form, and a feature grid. No FAQ, no testimonials, no pricing guidance. | **Needs more content** |
| **/corporate-events** | 500-600 est. | Moderate. Could use case studies, pricing bands, testimonials. | **Needs enrichment** |
| **/function-room-hire** | 500-600 est. | Similar to corporate-events. Missing room specs, capacity tables, photo gallery. | **Needs enrichment** |
| **/book-table** | 300 | Intentionally lean (it is a booking form page). Acceptable. | Fine for intent |
| **/beer-garden** | 1000+ | Good: features, amenities, FAQ, reviews, schema | Good |
| **/near-heathrow** | 1000+ | Good: terminal distances, features, FAQ | Good |
| **/drinks** | Menu-driven (dynamic) | Content is the drinks menu itself. Supporting text is minimal. | Adequate for a menu page |
| **/live-sport** | 500-600 | Thin. Generic "live sport" content. No schedule of upcoming fixtures, no photos of the viewing setup. | **Needs enrichment** -- 986 impressions at 1.1% CTR suggests demand |

---

## 7. Image Alt Text Audit

### Impact: MEDIUM

| Page | Image | Current Alt | Assessment |
|------|-------|-------------|------------|
| Homepage hero | Seasonal image | Dynamic via `getSeasonalAltText()` | Good -- contextual |
| Homepage logo | Logo image | "The Anchor logo - elegant anchor symbol with traditional British pub typography in white" | Good -- descriptive |
| Homepage gallery (roast) | Sunday roast photo | "Traditional Sunday roast at The Anchor" | Good |
| Homepage gallery (hire) | Private hire photo | "Private hire event at The Anchor" | Adequate -- could mention "function room" |
| Homepage gallery (garden) | Beer garden photo | "Beer garden at The Anchor - plane spotting paradise" | Good -- includes USP |
| /private-hire (wakes) | Wakes image | "Respectful wake gathering" | Missing location: should be "Respectful wake gathering at The Anchor, Stanwell Moor" |
| /private-hire (christenings) | Christening image | "Christening celebration" | Missing location |
| /private-hire (weddings) | Wedding image | "Wedding reception toast" | Missing location |
| /private-hire (parties) | Party image | "Private party celebration" | Missing location |
| /private-hire (baby showers) | Baby shower image | "Baby shower celebration" | Missing location |
| /private-hire (corporate) | Corporate image | "Professional corporate meeting" | Missing location |
| /book-table hero | Default header image | "The Anchor pub - book a table" | Adequate |
| /quiz-night event images | Dynamic events | `${event.name} quiz night at The Anchor` | Good -- dynamic and contextual |
| /music-bingo event images | Dynamic events | `${event.name} music bingo night at The Anchor` | Good |
| /karaoke event images | Dynamic events | `${event.name} at The Anchor` | Good |

**Pattern issue on /private-hire:** All six event-type card images have generic alt text without location or venue name. Since these are the visual entry points for high-value conversion pages, adding "at The Anchor near Heathrow" would help image search visibility for queries like "wake venue near heathrow" or "christening venue stanwell moor".

---

## 8. Additional Findings

### 8.1 "el pico" Wine Queries (0 clicks, 97 combined impressions)

The site ranks for "el pico sauvignon blanc" (pos 12) and "el pico cabernet sauvignon" (pos 10.57) but gets zero clicks. These queries likely match text in the drinks menu data. There is no dedicated content for wine. **Opportunity:** If the drinks menu mentions these wines, ensure the /drinks page has visible wine section headings that could earn featured snippets (e.g., "Our Wine List" with tasting notes).

### 8.2 Schema Markup Issues

- **/sunday-lunch** schema has `availabilityEnds: '2025-12-31'` -- this is in the past (current date is 2026-03-20). Google may treat the offer as expired. **Impact: HIGH -- fix immediately.**
- **/food-menu** has extensive schema (Menu, Restaurant, FAQPage, ItemList, Offer) -- well done.
- /quiz-night and /music-bingo use EventSchema components correctly for upcoming events.

### 8.3 Missing "Book a Table" in nav top-level

The navigation has no persistent "Book a Table" link visible in the top-level items (it appears in quickTasks). For a revenue-critical action, it should be a primary CTA button in the nav bar (which it appears to be via the `ctaButton` prop).

### 8.4 Whats-On Page as Event Hub

/whats-on is the #1 events landing page in the nav but only has 2 clicks from organic search. Its title includes parentheses which waste character space: `What's On at The Anchor (Near Heathrow T5)`. The dynamic event content is good but the page needs more static, crawlable content to rank for "things to do near heathrow" type queries.

---

## Priority Action Plan

### CRITICAL (do within 1 week)

| # | Action | Pages Affected | Expected Impact |
|---|--------|---------------|-----------------|
| 1 | **Fix root layout default title** -- replace keyword-stuffed title with clean `The Anchor \| Pub Near Heathrow \| Stanwell Moor` | All pages without custom titles | Prevents keyword stuffing penalties on fallback pages |
| 2 | **Shorten template suffix** to `%s \| The Anchor Stanwell Moor` | All pages using template | Gives individual pages 10+ more chars for unique keywords |
| 3 | **Fix expired schema date** on /sunday-lunch (`availabilityEnds: '2025-12-31'`) | /sunday-lunch | Google may be suppressing rich results |
| 4 | **Add /sunday-lunch CTA card to homepage** -- prominent link with "Book Sunday Lunch" in the "What Makes Us Special" or events section | Homepage, /sunday-lunch | Priority 1 revenue page needs link equity from strongest page |
| 5 | **Add /drinks link to homepage** body content | Homepage, /drinks | 551 impressions with 0.2% CTR -- needs authority flow |

### HIGH (do within 2 weeks)

| # | Action | Pages Affected | Expected Impact |
|---|--------|---------------|-----------------|
| 6 | **Rewrite title tags** for /quiz-night, /near-heathrow, /drinks, /live-sport, /corporate-events, /function-room-hire per recommendations above | 6 pages | Improved CTR on pages with high impressions / low clicks |
| 7 | **Add /restaurants-near-heathrow to "Visit Us" nav** group | Navigation, /restaurants-near-heathrow | 1010 impressions at 0.3% CTR -- needs discoverability |
| 8 | **Resolve /food-menu cannibalisation with /sunday-lunch** -- remove the full "Sunday Roast" content section from /food-menu and replace with a summary card linking to /sunday-lunch | /food-menu, /sunday-lunch | Consolidates authority for "sunday roast" queries to the dedicated page |
| 9 | **Add persistent event page links to homepage** -- cards or links to /quiz-night, /music-bingo, /karaoke in the "What's Coming Up" section | Homepage | These pages have 400-900+ impressions but get almost no clicks |
| 10 | **Fix /private-hire image alt texts** -- add "at The Anchor near Heathrow" to all six event-type card images | /private-hire | Image search visibility for venue queries |

### MEDIUM (do within 1 month)

| # | Action | Pages Affected | Expected Impact |
|---|--------|---------------|-----------------|
| 11 | **Enrich /private-hire hub page** -- add FAQ section, testimonials, pricing guidance, capacity table | /private-hire | 100 impressions at 1% CTR; hub page is thin |
| 12 | **Enrich /live-sport** -- add fixture schedule, photos of screens, "what we show" list (terrestrial only -- no Sky Sports) | /live-sport | 986 impressions at 1.1% CTR |
| 13 | **Enrich /corporate-events and /function-room-hire** -- room specs, capacity table, case studies, pricing bands | Both pages | Combined 593 impressions, both below position 24 |
| 14 | **Clean up /quiz-night H1** -- shorten from "Heathrow Quiz Night Pub & Trivia Night - Stanwell Moor, Staines & Surrey" to "Quiz Night at The Anchor" | /quiz-night | Reduce keyword-stuffing signal |
| 15 | **Rewrite /book-table meta description** -- remove "via our management platform" jargon | /book-table | Improved CTR for booking-intent queries |
| 16 | **Add internal cross-links** between /private-hire, /function-room-hire, and /corporate-events | All three pages | Currently siloed; consolidating internal links helps all three |

### LOW (backlog)

| # | Action | Pages Affected | Expected Impact |
|---|--------|---------------|-----------------|
| 17 | Add wine tasting notes or a wine section to /drinks for "el pico" queries | /drinks | 97 combined impressions; niche but free traffic |
| 18 | Audit all /private-hire subpages (wakes, christenings, etc.) for title/description consistency | 8+ pages | Low search volume individually but collectively meaningful |
| 19 | Shorten /beer-garden title to avoid truncation | /beer-garden | Already performing reasonably (2.8% CTR) |
| 20 | Add "Book a Table" to homepage H1 PageTitle area or just below it as visible CTA text | Homepage | Reinforce booking intent for Google |

---

## Appendix: GSC Opportunities by Page

### Biggest CTR improvement opportunities (high impressions, low CTR):

| Page | Impressions | Current CTR | Target CTR | Estimated Extra Clicks/Month |
|------|-------------|-------------|------------|------------------------------|
| /near-heathrow | 1,762 | 0.7% | 3% | +40 |
| /live-sport | 986 | 1.1% | 3% | +19 |
| /sunday-lunch | 774 | 1.2% | 4% | +22 |
| /drinks | 551 | 0.2% | 2% | +10 |
| /quiz-night | 431 | 0.2% | 3% | +12 |
| /corporate-events | 344 | 0.3% | 2% | +6 |
| /function-room-hire | 249 | 0.8% | 3% | +5 |
| **Total estimated gain** | | | | **+114 clicks/month** |

These are conservative estimates based on improving title tags and meta descriptions alone, without position changes. Actual gains from combined title + internal linking + content improvements should be higher.
