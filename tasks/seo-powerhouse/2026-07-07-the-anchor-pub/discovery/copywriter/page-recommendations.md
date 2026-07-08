# Page-by-Page Recommendations — The Anchor, 7 July 2026

Companion to `copywriter-report.md`. Every "Recommended" title below is the **final rendered title** (assumes the SEO-003 template fix lands so the layout stops appending a second brand). All recommended strings follow SSOT voice rules: British English, no em dashes, "The Anchor" as brand. Prices shown as `£{live}` mean "interpolate from the live source", never hardcode. Rubric scores are Relevance / Quality / Technical SEO / Competitiveness (1–5); Competitiveness is inferred (no rank data this run, per shared contract).

Fix-type labels: **[T]** Template/system fix · **[P]** One-off page fix · **[C]** Content process fix.

---

## 1. /sunday-roast
**Target keyword:** sunday roast near heathrow (secondary: sunday roast staines, sunday lunch near heathrow, carvery near heathrow)
**Current status:** Best copy on the site. SSOT-clean (walk-in, vegan wellington, gravy/potato wording, prices deferred to live menu). Metadata is the only problem. Scores: 5 / 5 / 3 / 4.

| Element | Current | Recommended | Notes |
|---|---|---|---|
| Title | "Sunday Roast Near Heathrow \| The Anchor Pub, Stanwell Moor \| The Anchor Stanwell Moor" (85) | "Sunday Roast Near Heathrow & Staines \| The Anchor" (49) | Brand once, adds the Staines demand the strategy names, kills "The Anchor Pub" [T + P: `app/sunday-roast/page.tsx:40`] |
| Meta description | "Proper Sunday roast 7 minutes from Heathrow T5. Walk in 1pm to 6pm, no booking and no pre-order needed. Beef, pork, turkey, pies and a vegan option." (148) | "Proper Sunday roast near Heathrow and Staines. Walk in 1pm to 6pm, no booking or pre-order. Beef, pork, turkey, pies and a vegan wellington. Free parking." (154) | Current is good; rewrite only adds Staines + parking and names the wellington (differentiator). Either is acceptable [P] |
| H1 | "Sunday Roast Near Heathrow" | Keep | Matches intent exactly |

**Content improvements**
- None required to body copy. The H2 "Sunday Roast Near Heathrow at The Anchor" (PageTitle block) nearly duplicates the H1; acceptable, but if edited for any reason prefer "A proper Sunday roast in Stanwell Moor, near Staines" to widen local coverage without a second near-identical heading. [P]
- Light local widening: one sentence in the "Finding Us" section already names Staines and Stanwell Moor; sufficient. Do not add more keyword variants; the page is at healthy optimisation.

**Internal linking**
- Add one contextual link in the "Big Tables, Groups and Booking" section: anchor "private hire for larger gatherings" → `/private-hire` (groups of 10+ overlap with the deposit paragraph; currently no path from roast traffic to the priority-2 hub). [P]

---

## 2. /private-hire
**Target keyword (recommended interim):** private hire near heathrow / private room hire staines — see cannibalisation note.
**Current status:** Broken 289-char meta, H1 collides with /function-room-hire, body copy thin (June open item). Facts otherwise clean; buffet "from £11pp" is live-interpolated (correct pattern). Scores: 3 / 3 / 2 / 3.

| Element | Current | Recommended | Notes |
|---|---|---|---|
| Title | "Function Room Hire Near Heathrow & Staines \| The Anchor \| The Anchor Stanwell Moor" (82) | "Private Hire Near Heathrow & Staines \| The Anchor" (49) | Interim retarget so this page owns the umbrella term and /function-room-hire owns "function room hire". Does not pre-empt the SEO-009 keeper decision (no URLs change) [P: `app/private-hire/page.tsx:105`] |
| Meta description | 289 chars, broken grammar, "no room-hire fee" unverified sitewide | "Private hire near Heathrow and Staines for 10 to 150 guests. Wakes, parties and meetings. Buffets from £{live}pp, free parking and a dedicated events team." (~151 with live price) | Fix the interpolation at `app/private-hire/page.tsx:103`; keep `getLowestFoodPrice` token. Drop "no room-hire fee" unless owner confirms and SSOT §11 is updated first [P] |
| H1 | "Function Room Hire Near Heathrow & Staines" | "Private Hire Near Heathrow & Staines" | Pairs with the title retarget; hero lead already says "Private hire for 10+ to 150 guests" [P] |

**Content improvements** (brief for editorial-team; ~600–900 added words)
1. New prose section after the occasions grid, H2 "Our spaces and what they hold": dining room (26 seated per SSOT §8, standing room for more, French doors to the garden), beer garden (64 seats), full-venue options (up to 150 private hire; 250 venue max). Every number from SSOT/`lib/private-hire-capacity.ts`, not typed inline. [C]
2. New prose section, H2 "How pricing works": quote varies by event type, day and party size; £250 deposit; catering from live packages; explicitly avoid minimum-spend wording (SSOT §11). Mirrors the wording already shipped on /function-room-hire:209. [P]
3. New prose section, H2 "How booking works": enquire → walkthrough/quote → confirm with deposit; note wakes accept 24–48 hour notice with a link to `/private-hire/wakes`. [P]

**Internal linking**
- In the new pricing section, anchor "buffet and catering packages" → `/private-hire#enquiry` quote builder and "Christmas party packages" → `/christmas-parties` (seasonal push, SEO-010 window). Existing landmark/occasion links are good; keep.

---

## 3. /book-table
**Target keyword:** book a table the anchor / pub near heathrow book table (largely navigational-transactional)
**Current status:** Strong conversion page; metadata title doubles brand exactly; £-symbol bug hits both meta and visible dish preview. Scores: 4 / 4 / 2 / 4.

| Element | Current | Recommended | Notes |
|---|---|---|---|
| Title | "Book a Table for Pub Food \| The Anchor Stanwell Moor \| The Anchor Stanwell Moor" (79) | "Book a Table \| The Anchor, Stanwell Moor" (40) | Exact-duplicate brand today; "for Pub Food" is awkward and adds nothing to a navigational query [T + P: `app/book-table/page.tsx:46`] |
| Meta description | "Reserve your table at The Anchor, Stanwell Moor, quick confirmation. Food from 4. …" (168) | "Book a table at The Anchor, Stanwell Moor, 7 minutes from Heathrow T5. Quick confirmation, free parking, dog friendly. Food from £{live} with live menu prices." (~157) | Depends on the formatMenuPrice £ fix (P2) [T] |
| H1 | "Book a Table for Pub Food at The Anchor, Stanwell Moor" | "Book a Table at The Anchor, Stanwell Moor" | Same awkward qualifier; the lead sentence already lists food types [P] |

**Content improvements**
- Fix visible price labels "Chips(4)" → "Chips (£4)" via the formatter fix (P2, `lib/menu-page-data.ts:187-190`); no copy edit needed once fixed. [T]
- FAQs and Getting Here prose are accurate against SSOT (deposit, buses, ULEZ, 20 spaces). No further changes; do not add content that pushes the form further down the page.

**Internal linking**
- Already links /food-menu, /sunday-roast, /find-us and the dining cluster. Sufficient.

---

## 4. /christmas-parties
**Target keyword:** christmas party venue near heathrow / christmas party staines 2026
**Current status:** Right page, right window, good structure and 2026 dating; undermined by ~20 hardcoded prices, a wrong T2 time, an undated taxi fare and spend-target wording. Scores: 5 / 3 / 3 / 4.

| Element | Current | Recommended | Notes |
|---|---|---|---|
| Title | "Christmas Party Venue Near Heathrow & Staines \| 2026 \| The Anchor Stanwell Moor" (79) | "Christmas Parties Near Heathrow & Staines 2026 \| The Anchor" (59) | Keeps year freshness signal, brand once [T + P] |
| Meta description | current (142) is accurate | Keep | 10+ to 150 matches SSOT private-hire capacity |
| H1 | "Christmas party near Heathrow, pub dinners, party nights & festive lunch 2026" (78) | "Christmas Parties Near Heathrow & Staines 2026" | Current H1 is a keyword string, not a heading; move "pub dinners, party nights and festive lunches" into the lead sentence below it [P] |

**Content improvements**
1. **Replace every hardcoded food/drink price** (`client-components.tsx:777, 815-821, 833-834, 952-956`) with live-price components; the page already does this correctly at :832 ("live price"). Where the management DB has no row for a festive add-on, drop the number and use "current prices confirmed on your quote". [P — blocks recrawl request]
2. Fix "fifteen minutes from Terminal 2" → "11 minutes" (:201, SSOT §2). Either delete the £18–22 taxi fare or date it after owner confirmation. [P]
3. Remove "£45-£52 spend target" (:832) or route through SSOT-first approval (§11 bans published minimum-spend wording). [P]
4. Booking-terms block (:667, :1054-1059) is clear and consistent; keep. Pre-order language is compliant here (SSOT §11 allows it for private events and Christmas).

**Internal linking**
- Inbound push before the Jul–Oct peak (SEO-010): add one contextual link from `/whats-on` (exists), `/private-hire` (exists), plus **new**: homepage "Coming up" area and `/corporate-events` → anchor "corporate Christmas parties near Heathrow" → `/corporate-christmas-parties` or `/christmas-parties` as appropriate. [P]

---

## 5. /private-hire/wakes
**Target keyword:** wake venue near staines / wake venue near heathrow / funeral reception venue staines
**Current status:** The winning niche page, warm and well-judged tone, live buffet pricing done correctly; but capacity and distance facts are wrong and internally contradictory. Fix before requesting recrawl. Scores: 5 / 4 / 3 / 4.

| Element | Current | Recommended | Notes |
|---|---|---|---|
| Title | "Wake Venue Near Staines & Heathrow \| Private Room \| Private Hire at The Anchor" (78) | "Wake Venue Near Staines & Heathrow \| The Anchor" (47) | Brand once; "Private Room" is in the description [T + P] |
| Meta description | "…Up to 50 guests, buffet packages from £12pp, free parking. Compassionate staff." (164) | "Private room for wakes, funeral teas and celebrations of life near Staines and Heathrow. Buffet packages from £{live}pp, free parking, short notice welcome." (~156) | Removes the capacity number until the owner settles it; keeps the live £12pp token; adds the short-notice USP (SSOT §11: 24-48 hours accepted) [P: `page.tsx:32`] |
| H1 | "Wakes, Funeral Receptions & Celebrations of Life" | Keep | Right register for the audience; "wake venue" is carried by title/PageTitle block |

**Content improvements**
1. **Capacity: one number, everywhere.** Meta says 50, schema says 50 (:73), body says "20 to 60 seated" (:177, :205), SSOT §8 says the dining room seats 26 (private hire overall 10+ to 150). Owner must confirm what a wake can actually hold; update `docs/SSOT.md` first if reality has changed, then align meta, `maximumAttendeeCapacity`, and both body mentions to it. Interim safe wording: "The private dining room seats 26, with standing room for more; larger receptions can use more of the pub by arrangement." [P + C]
2. **Distance:** ":210 'just five minutes from South West Middlesex Crematorium'" and FAQ ":410 '5 minutes'" → "10 minutes", matching SSOT §11 and the landmark card already rendered on this page (`lib/local-seo-data.ts:20`). [P]
3. Add one short answer block near the top (extractable for AI answers, matches how families actually search): H3 "How quickly can a wake be arranged?" + two sentences: same private room, 24 to 48 hours notice accepted, call 01753 682707 and we take it from there. SSOT §11 verifies all three facts. [P]

**Internal linking**
- Crematorium landmark links already present and correct. Add anchor "catering packages and current prices" → `/private-hire#enquiry` quote builder near the packages section. [P]

---

## 6. /near-heathrow
**Target keyword:** pub near heathrow / pub near heathrow airport (June GSC: position 6.8, dated evidence)
**Current status:** Adequate body copy (June item closed to "keep"), overlong meta, title doubled by template. Striking-distance page; metadata polish is the play. Scores: 4 / 4 / 3 / 4.

| Element | Current | Recommended | Notes |
|---|---|---|---|
| Title | "Pub Near Heathrow Airport \| The Anchor, 7 Mins from T5 \| The Anchor Stanwell Moor" (81) | "Pub Near Heathrow Airport, 7 Mins from T5 \| The Anchor" (54) | Brand once; keeps the proximity hook that differentiates in this SERP [T + P] |
| Meta description | 232 chars (truncates) | "Traditional pub 7 minutes from Heathrow Terminal 5. Free parking, fresh pub food, Sunday roasts and a dog-friendly beer garden under the flight path." (149) | Cut ULEZ/menu subclauses that push it past 160; they survive in body copy [P: `app/near-heathrow/page.tsx:34`] |
| H1 | "The Anchor: Your Pub Near Heathrow Airport" | Keep | Entity + keyword, fine |

**Content improvements**
- None structural. OG description claims "The closest traditional pub to Heathrow Terminal 5" which matches the SSOT marketing description ("closest traditional British pub to Heathrow"); keep wording aligned with SSOT phrasing exactly to avoid a "closest pub" absolute that competitors could dispute: prefer "the closest traditional pub to Terminal 5" form it already uses. No change required.

**Internal linking**
- Already the hub for terminal pages, parking and dining cluster. Sufficient.

---

## 7. /food-menu
**Target keyword:** pub food menu stanwell moor / food near heathrow (support page for priority-1)
**Current status:** Live menu with prices, good FAQs; "Dishes from 4." snippet bug; title overlong via template. Scores: 4 / 4 / 3 / 4.

| Element | Current | Recommended | Notes |
|---|---|---|---|
| Title | "Pub Food Menu in Stanwell Moor \| Near Heathrow T5 \| The Anchor Stanwell Moor" (76) | "Pub Food Menu Near Heathrow T5 \| The Anchor" (43) | Stanwell Moor is carried by the brand suffix and body [T + P: `app/food-menu/page.tsx:124`] |
| Meta description | "…Dishes from 4. …" (138) | "Pub food menu in Stanwell Moor near Heathrow T5 with live dishes and prices. Dishes from £{live}. Free parking, Sunday roast and easy table booking." (~148) | Fixed by P2 formatter change; keep the live token [T] |
| H1 | "Proper pub food, minutes from Heathrow" | Keep | Good voice, intent-matched |

**Content improvements**
- None. The page correctly refuses to hardcode prices and its Sunday-roast FAQ answers are SSOT-compliant (walk-in, no pre-order).

**Internal linking**
- Sufficient (booking CTA, Sunday roast, dining cluster).

---

## 8. / (homepage)
**Target keyword:** the anchor stanwell moor (navigational) + entity hub for everything else
**Current status:** Well-structured hub, good FAQs; title carries no brand at all (template does not apply to root segment). Scores: 4 / 4 / 3 / 4.

| Element | Current | Recommended | Notes |
|---|---|---|---|
| Title | "Pub Food in Stanwell Moor \| 7 Mins from Heathrow T5" (51, no brand) | "The Anchor, Stanwell Moor \| Pub Food Near Heathrow T5" (54) | Entity first: navigational searchers and AI engines need the brand in the homepage title. [P: `app/page.tsx:32`] |
| Meta description | current (149) is good | Keep | |
| H1 | "Eat, Drink, Enjoy." | Keep (see note) | Motto-as-H1 is a deliberate brand choice; the crawl shows keyworded H2/H3s and schema carrying relevance. Optional upgrade if ever revisited: H1 "The Anchor, Stanwell Moor" with "Eat, Drink, Enjoy." as the strapline above it. Not a priority. |

**Content improvements**
- Add a "Christmas parties" card/link to the "Coming up at The Anchor" or "What are you here for?" block from July onward (seasonal booking window, SEO-010). [P]

---

## 9. /restaurants-near-heathrow
**Target keyword:** restaurants near heathrow (modifier long-tail per strategy; don't chase the head)
**Current status:** June body-copy item delivered: 2,359 words, terminal-by-terminal sections, stay-or-leave decision block, honest comparison framing. "9 draught beers" fixed (:450). Scores: 4 / 4 / 3 / 3 (head term directory-walled; long-tail competitive).

| Element | Current | Recommended | Notes |
|---|---|---|---|
| Title | "Restaurants Near Heathrow Airport \| The Anchor, 7 Mins T5 \| The Anchor Stanwell Moor" (84) | "Restaurants Near Heathrow \| The Anchor, 7 Mins from T5" (54) | Brand once [T] |
| Meta description | 172 chars (truncates) | "Looking for restaurants near Heathrow? The Anchor is a proper British pub 7 minutes from Terminal 5. Free parking, home-cooked food and Sunday roasts." (150) | Trim "Walk in or book" clause pushing past 160 [P] |
| H1 | "Restaurants Near Heathrow Airport" | Keep | |

**Content improvements**
- H2 "Best For Food Near Heathrow" reads oddly (label grammar). Suggest "What kind of visit are you planning?" above the use-case cards. Cosmetic; low priority. [P]

**Internal linking**
- Terminal pages, menu, booking all linked. Sufficient.

---

## 10. /function-room-hire
**Target keyword:** function room hire near heathrow
**Current status:** Deep page (1,910 words), pricing section is SSOT-exemplary ("quotes vary… live approved source… £250 deposit"); title carries "The Anchor Pub" + doubled brand. Cannibalises /private-hire until SEO-009 resolves. Scores: 4 / 4 / 3 / 3.

| Element | Current | Recommended | Notes |
|---|---|---|---|
| Title | "Function Room Hire Near Heathrow \| The Anchor Pub \| The Anchor Stanwell Moor" (76) | "Function Room Hire Near Heathrow \| The Anchor" (45) | Strip "The Anchor Pub", brand once [T + P: `page.tsx:22,25,30`] |
| Meta description | current (133) is accurate (£250 deposit = SSOT ✓) | Keep | |
| H1 | "Function Room Hire Near Heathrow" | Keep | This page keeps the "function room" target under the interim retarget of /private-hire (block 2) |

**Content improvements**
- None pressing. If SEO-009 later consolidates, this page's pricing and layout sections are the content worth keeping.

**Internal linking**
- Keep the existing link to /private-hire; after the interim retarget, update its anchor to "all private hire options" (currently both pages describe each other with the same phrase).

---

## 11. /corporate-events
**Target keyword:** corporate event venue near heathrow
**Current status:** Good hotel-differentiation angle ("Pub setting, not a hotel"); 90-char title with brand twice; one unverified saving claim. Scores: 4 / 4 / 3 / 3.

| Element | Current | Recommended | Notes |
|---|---|---|---|
| Title | "Corporate Event Venue Near Heathrow \| Free Parking \| The Anchor \| The Anchor Stanwell Moor" (90) | "Corporate Event Venue Near Heathrow \| The Anchor" (48) | Free parking belongs in the description, which already has it [T + P] |
| Meta description | 161 chars | "Corporate event venue near Heathrow with private rooms, team building space and free parking, 7 minutes from Terminal 5. A pub setting, not a hotel." (148) | Keeps the differentiator, back under 160 [P] |
| H1 | "Corporate Event Venue Near Heathrow" | Keep | |

**Content improvements**
- ":359 'Save £20-40 per day'" (parking vs hotels): soften to "free parking for every attendee, unlike most hotel venues nearby" unless the owner supplies a dated source. [P]
- Heading ":Also Perfect For:" carries a trailing colon in an H3; drop the colon. Cosmetic. [P]

---

## 12. /plane-spotting-heathrow
**Target keyword:** heathrow plane spotting pub / plane spotting heathrow (protect-and-convert)
**Current status:** The moat page. Accurate, useful, good cross-sell H3s (roast before/after spotting). Needs only the freshness pass (SEO-016) and title trim. Scores: 5 / 4 / 4 / 5.

| Element | Current | Recommended | Notes |
|---|---|---|---|
| Title | "Heathrow Plane Spotting Pub \| Beer Garden Views \| The Anchor Stanwell Moor" (74) | "Heathrow Plane Spotting Pub & Beer Garden \| The Anchor" (54) | Brand once [T] |
| Meta description | current (143) accurate | Keep | |
| H1 | "Heathrow Plane Spotting Pub and Beer Garden" | Keep | |

**Content improvements**
- Freshness pass per SEO-016: add a dated line ("Updated July 2026") near the viewing-times guidance and re-verify the runway-alternation facts against SSOT §9 (alternation weekly, ~every 90 seconds at peak, 500-800 ft). AI engines already cite this page; dating strengthens citability. [P]

---

## 13. /whats-on
**Target keyword:** pub events near heathrow (maintain-only per strategy)
**Current status:** Serviceable hub; metadata overclaims frequency vs SSOT. Scores: 4 / 3 / 3 / 3.

| Element | Current | Recommended | Notes |
|---|---|---|---|
| Title | "Pub Events Near Heathrow \| Quiz, Bingo, Karaoke & Live Music \| The Anchor Stanwell Moor" (87) | "Quiz, Bingo & Live Music Near Heathrow \| The Anchor" (51) | Brand once; karaoke removed from evergreen metadata (SSOT §10: occasional, promote only when listed) [T + P: `page.tsx:24-33`] |
| Meta description | "Pub events near Heathrow this week… karaoke & live music… from £3." | "Pub events near Heathrow: Music Bingo, quiz night, cash bingo and live music at The Anchor, Stanwell Moor. Monthly dates, free parking, entry from £3." (150) | "This week"/OG "Weekly" contradict SSOT monthly formats; £3 entry is SSOT-confirmed so may stay [P] |
| H1 | "Always something happening" | Keep | Events are maintenance-only; brand voice fine, keyworded H2s carry relevance |

**Content improvements**
- None beyond metadata; the £3/£10 figures in body copy are SSOT-confirmed non-food figures and may remain.

---

## 14. /beer-garden
**Target keyword:** beer garden near heathrow / pub garden heathrow flight path
**Current status:** Strong, accurate flight-path content (matches SSOT §9). One hardcoded food price; overlong title. Scores: 4 / 4 / 3 / 4.

| Element | Current | Recommended | Notes |
|---|---|---|---|
| Title | "Beer Garden Near Heathrow \| Plane Spotting Pub Garden \| The Anchor Stanwell Moor" (80) | "Beer Garden Under the Heathrow Flight Path \| The Anchor" (55) | Distinctive vs the plane-spotting page's title, brand once; avoids two near-identical "plane spotting pub" titles competing [T + P] |
| Meta description | current (143) accurate | Keep | |
| H1 | "Beer Garden Near Heathrow" | Keep | |

**Content improvements**
- ":102 hero lead 'food from £10'": replace with the live `priceFromLabel` token (pattern from /food-menu) or drop the number: "Plan a plane spotting visit with a pint and proper pub food, dogs welcome". [P]

---

## 15. /heathrow-parking
**Target keyword:** cheap heathrow parking / heathrow parking alternative (convert-don't-chase)
**Current status:** Long, persuasive, conversion-focused; the copy risk is price integrity, not quality. Own rates are hardcoded in title/meta/body while :147 already interpolates a live daily rate; competitor rates are undated. Scores: 4 / 4 / 3 / 2 (head term aggregator-walled; page's job is converting existing traffic).

| Element | Current | Recommended | Notes |
|---|---|---|---|
| Title | "Cheap Heathrow Parking from £15/day \| 7 Mins to T5 \| The Anchor Stanwell Moor" (77) | "Cheap Heathrow Parking from £{live}/Day \| The Anchor" (~48) | Keep the price hook (it earns the click) but drive it from the live rate the page already fetches; parking is a non-food price so SSOT permits it "where confirmed" [T + P] |
| Meta description | current, rates hardcoded | Same copy with `£{live}` day/week tokens and "save up to 60%" only if owner re-confirms | The 60% claim needs a dated basis [P] |
| H1 | "Heathrow Parking: Book, Pay & Park in Stanwell Moor" | Keep | |

**Content improvements**
- Wire remaining hardcoded own-rate strings (:113-119, :211, :305, :353, :393) to the live parking rates. [P]
- Add a checked-date line under the comparison table: "Official Heathrow rates checked July 2026" and re-verify £46.80/£39/£118+ at that date; undated competitor prices rot and invite complaints. [P + C]

---

## New content outlines

None. Strategy explicitly rejects new page creation this cycle beyond keyword-plan-validated terms (June over-publication lesson). The only net-new copy is the /private-hire prose sections (block 2) and the /private-hire/wakes answer block (block 5), both on existing URLs via editorial-team.

## Execution notes for the orchestrator

- **Order:** P2 formatter fix and SEO-003 template fix first (they change what half these metadata recommendations render as), then the fact fixes on wakes/christmas (blocks 4-5), then metadata rewrites, then the recrawl queue (SEO-005).
- **Owner decisions required (batch):** true wake capacity; "no room-hire fee" claim; Christmas spend-target wording; parking "save up to 60%" and competitor-rate refresh; taxi-fare figure. Recommended defaults if no answer: use SSOT values, drop the unverified claims.
- **All body rewrites route via `editorial-team`** with the SSOT extracts embedded in each brief (process fix P3).
