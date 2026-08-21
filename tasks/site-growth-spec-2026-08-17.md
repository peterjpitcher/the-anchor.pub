# Site growth spec: what is holding the-anchor.pub back

**Date:** 17 August 2026
**Method:** full live crawl of all 226 sitemap URLs (status, title, description, canonical, robots, headings, rendered word count, JSON-LD, internal links), 5-gram duplicate-content analysis across every templated page family, end-to-end test of all 684 redirect rules, and a source review of the sitemap, middleware and metadata builders.
**Companion report:** [GSC audit, 17 Aug 2026](./gsc-audit-2026-08-17.md) covers indexing status. This spec covers everything else.
**Keyword evidence:** [keyword plan, 17 Aug 2026](./keyword-plan-2026-08-17-site-growth.md). Two GKP rounds, 90 terms tested, run after this spec's first draft. **It changed three recommendations below**, marked REVISED.

---

## Verdict

The site is technically sound and editorially diluted.

Nothing is broken in the way the phrase "SEO problem" usually implies. Every sitemap URL returns 200, every canonical is self-referencing, every redirect resolves in one hop, Core Web Vitals are green, and there are no manual actions. The last audit proved that and this one confirms it.

The growth ceiling is a **quality-mix problem**. The site publishes 226 indexable pages for a single village pub, and a large share of them are near-duplicate templated pages that cannot win anything and dilute the domain's overall quality signal. Alongside that, 39% of all pages carry a malformed title, the internal link graph is almost flat, and the content engine stopped in April.

Measured evidence:

| Finding | Measurement |
|---|---|
| Pages with the brand name twice in the `<title>` | **88 of 226 (39%)** |
| Hotel proximity pages, mean 5-gram content overlap with each other | **83.3%** (max 86.3%) |
| Parking terminal pages, mean overlap | **64.4%** (and only 439 to 444 words each) |
| Event pages as a share of the whole index | **56 of 226 (25%)**, of which 30 are past events |
| Event pages sharing an identical title with another page | **18** across 6 clusters |
| Pages with 2 or fewer inbound internal links | **119 of 226 (53%)** |
| Pages under 300 rendered words | **15** |
| Meta descriptions outside the 70 to 165 character range | **75** (longest 362 chars) |
| Blog posts published May to July 2026 | **0** |

The fixes below are ordered by expected effect on organic growth, not by effort.

---

## What is already healthy, do not spend money here

State this plainly so effort is not misdirected:

- **Redirects.** 684 rules, all 301, zero chains, zero loops, zero self-redirects. Every one of the 142 concrete destinations resolves. I initially flagged 17 `/post/*` rules as pointing at 404s; end-to-end testing disproved it, because earlier rules in `wix-redirects.json` catch them first and land on `/blog` in a single hop. **No redirect work is required.**
- **Canonicals.** 226 of 226 self-referencing and correct. The root layout correctly carries `metadataBase` only.
- **Indexing plumbing.** No `noindex` page appears in the sitemap. robots.txt is correct.
- **Core Web Vitals.** 121 good URLs on both mobile and desktop, none poor. Performance is not the constraint.
- **Town pages** (`/staines-pub`, `/feltham-pub`, and the other 15). Mean overlap 1.1%, genuinely differentiated, 591 to 1,380 words. These are the template family done properly and are the model for fixing the others.
- **Terminal pages** (`/near-heathrow/terminal-2` to `-5`). 16% overlap, 1,235 to 1,524 words. Fine.

---

## P0: fix the titles (88 pages)

### The defect

`app/layout.tsx` sets a title template of `'%s | The Anchor'`. `app/private-hire/layout.tsx` sets a second one. Pages then hard-code `| The Anchor` into their own title, so the brand is appended twice, and three times on the private-hire branch.

Live examples:

```
Pub Near Hilton Heathrow | Free Parking | The Anchor | The Anchor          (65 chars)
Celebration Venue Near Staines Registration Office | The Anchor | Private Hire at The Anchor   (92)
Christening & Celebration Venue Near Our Lady of the Rosary RC Church | The Anchor | Private Hire at The Anchor   (115)
Mother's Day Lunch & Sunday Roast Near Staines | The Anchor | The Anchor   (76)
```

At 115 characters the useful half of the title never reaches a search result. Every one of these pages is spending its most valuable ranking real estate repeating a brand name nobody is searching for.

The GSC audit spotted this on `/mothers-day` alone. It is not one page, it is 88.

### Breakdown

| Family | Pages affected | Cause |
|---|---:|---|
| Event pages | 36 | Title built in `app/events/[id]/page.tsx` from DB copy that already contains the brand |
| `/private-hire/near/*` | 17 | `generateMetadata` appends `| The Anchor`, then the private-hire layout template appends again |
| `/pub-near-*-heathrow` | 11 | `buildHotelProximityMetadata` appends `| The Anchor` |
| Core pages | 13 | Hard-coded in each page's `metadata` export |
| Blog posts | 10 | Brand baked into the front-matter `title` |
| `/private-hire/brochures` | 1 | Hard-coded |

### The fix

1. **Establish one rule:** page-level `title` values never contain "The Anchor". The layout templates own the brand suffix. Add a Jest test that fails the build if any page's resolved title matches `/The Anchor.*The Anchor/`.
2. `components/features/HotelProximityPage.tsx`: change the title to `Pub Near ${name} Heathrow | Free Parking`.
3. `app/private-hire/near/[slug]/page.tsx`: change to `${label} Near ${landmark.name}`. Also shorten `label` for the three church slugs; "Christening & Celebration Venue" is too long to survive the suffix.
4. `app/events/[id]/page.tsx`: strip a trailing brand suffix from the DB-sourced title before use, and append the event date instead (see P0 event section).
5. The 13 core pages and 10 blog front-matter titles: remove the suffix by hand.
6. `app/private-hire/layout.tsx`: decide whether the nested template earns its place. Recommend removing it so private-hire pages inherit the single root template; the extra segment costs about 22 characters on every page in the branch and adds nothing.

**Effort:** M (4 to 6 hours including the guard test). **Risk:** low. **Files:** about 30.

---

## P0: consolidate the 11 hotel pages

### The defect

The 11 `/pub-near-*-heathrow` pages are **83.3% identical to one another** by 5-gram overlap. The only things that vary are the hotel name and a one-line `brandNote`. They also share a single templated meta description with only the hotel name swapped, and every one of them lacks `BreadcrumbList` schema.

This is the definition of a doorway page set: near-identical pages generated to funnel visitors to the same destination. It is the single clearest quality liability on the domain, and it is 5% of the index.

There is no evidence of search demand for "pub near [hotel name] heathrow" as a query. The August keyword work already established that town-name terms return no Keyword Planner data for this area; branded-hotel proximity terms are thinner still.

### The fix (REVISED TWICE, final)

This one took three passes to get right, and the corrections are worth recording.

- **Draft 1:** consolidate the 11 into `/heathrow-hotels-pub`. **Wrong.** GKP showed "pub near heathrow hotels" has no demand at all.
- **Draft 2:** delete `/heathrow-hotels-pub` too, send everything to `/restaurants-near-heathrow`. **Also wrong.** I had assumed `/heathrow-hotels-pub` was more of the same thin template. It is not.
- **Final, after measuring it:**

| Page | Words | Overlap with `/restaurants-near-heathrow` | Action |
|---|---:|---:|---|
| The 11 `/pub-near-*` pages | 873 to 899 | they are 83.3% duplicates **of each other** | **Delete** |
| `/heathrow-hotels-pub` | **1,187**, 12 h2s | **1.1%** | **Keep**, and use as the 301 target |

`/heathrow-hotels-pub` is not a doorway page. It is 1,187 words on a real angle ("escape hotel prices", the alternative to hotel dining) sharing almost nothing with `/restaurants-near-heathrow`. It is also the honest destination for the 11 redirects, because it answers the question they were built for.

- Add the 11 redirects to `config/redirects/additional-redirects.json` as 301s to `/heathrow-hotels-pub`.
- Delete the 11 route directories and their sitemap entries. Keep `/heathrow-hotels-pub` in the sitemap.
- Delete `HotelProximityPage.tsx` with them, it has no other consumer.
- Retitle `/heathrow-hotels-pub` away from the zero-demand head term, towards its actual angle.

Net effect: 11 near-duplicate pages fold into one substantial page that already exists, and the index loses about 5% of its dead weight without losing any unique content.

**The lesson worth keeping:** "it is part of a bad page family" is a hypothesis, not a finding. Measure the individual page before deleting it.

**Effort:** M (one page rewrite plus mechanical deletion). **Risk:** low, these pages have 2 inbound internal links each and no evidence of traffic. **Reversible:** yes, via git.

---

## P0: cut the event page tail

### The defect

56 event pages are 25% of the entire index. Of those:

- **30 are past events.** Median 441 rendered words.
- **10 have legacy undated slugs** (`/events/quiz-night-april--2025`) at 187 to 202 words, the thinnest pages on the site.
- **18 share an identical title with at least one other page**, in 6 clusters. Four pages are all titled exactly `Quiz Night | The Anchor`. Five are all `Bingo Night at The Anchor Stanwell Moor | Cash Prizes Monthly | The Anchor`.
- **53 of 56 have exactly one inbound internal link**, the `/whats-on` listing. They are dead-end leaves.
- The recurring quiz pages hit **74.4% mutual content overlap**.

`lib/event-seo-strategy.ts` documents a deliberate policy that past events stay indexed forever, on the reasoning that "each night adds to what the site can rank for". The evidence does not support that for the thin end of the tail: these are precisely the URLs GSC reports under *crawled, currently not indexed* and *duplicate, Google chose a different canonical*. Google is already declining to index them. They are not accumulating ranking surface, they are accumulating crawl waste.

The policy is right for substantial event pages. It is wrong for 200-word duplicates.

### The fix

Introduce a **quality floor** in `lib/event-seo-strategy.ts`, applied only to events whose date has passed:

| Condition (past events only) | Action |
|---|---|
| Under 350 rendered words, **or** title duplicates another event page | 301 to the format hub (`/quiz-night`, `/cash-bingo`, `/karaoke`, `/music-bingo`), drop from sitemap |
| The 10 legacy undated slugs | 301 to the format hub regardless of length, they are 2025 duplicates with no date to disambiguate |
| **Themed past events** (Gavin and Stacey, Only Fools and Horses, and similar) | 301 to the new themed-quiz hub, see below |
| 350+ words and a unique title | Keep live and indexed, unchanged |
| Future events | Keep live and indexed, unchanged |

**Also fix while you are in here:** every event page renders its data table **twice**. "More event details" and "Event information" output the same seven fields (date, start, end, booking type, event type, category, price). That is all 56 pages padding themselves with a duplicate block.

Then **make every remaining event title unique** by appending the date: `Quiz Night at The Anchor, Stanwell Moor, 7 October 2026`. The date is what distinguishes one instance from another, so it belongs in the title.

Expected outcome: roughly 20 thin pages retire, about 36 substantive event pages remain, and the duplicate-title clusters disappear entirely.

**Effort:** M to L (the rule is small; the redirect generation and testing is the work). **Risk:** medium, this reverses a documented decision, so it needs your sign-off (see decision 1).

---

## P1: retarget parking, do not build four pages against unwinnable terms (REVISED)

`/heathrow-parking/terminal-2` through `-5` are **64.4% identical** and only **439 to 444 words** each. You approved building all four out. The keyword data says build them out, but **stop aiming them at the terms they are currently aimed at**.

The four terminal terms are 50,000/mo each, 200,000/mo combined, the largest demand pool touching this site. Every one sits at competition index 66 to 72 with £2+ top-of-page bids. That SERP belongs to Heathrow's own site and the aggregators (Holiday Extras, APH, Purple Parking). No amount of page quality puts a village pub in that top ten.

I tested the obvious escape route and it does not exist. Every off-airport angle returned **no data**: `pub parking heathrow`, `non airport parking heathrow`, `heathrow parking alternatives`, `airport parking stanwell moor`, `heathrow parking stanwell`, `parking near heathrow with shuttle`. Nobody searches for an alternative to airport parking.

**One term in 36 tested is both high-volume and winnable:**

> `heathrow parking prices`: **5,000/mo, Low competition (index 22)**, bids £0.22 to £0.58

Every other parking term carrying volume sits at index 51 to 86. This one is informational ("what does it actually cost?"), which is exactly the question the aggregators answer badly because they serve a booking funnel instead of an answer.

### The fix

1. **Rebuild `/heathrow-parking` around `heathrow parking prices`.** An honest price comparison: official car parks, the aggregators, and The Anchor, including transfer time and total real cost. This becomes the acquisition page.
2. **Keep the four terminal pages and still build them out**, because they serve people who have already found you and need terminal-specific detail. Fix the 64% duplication with genuinely different content per terminal (drive time, drop-off route, airlines served, early-flight timing). Treat them as supporting pages linked from the hub, not as ranking plays.
3. **Do not bid on the terminal head terms.** At £2.64 top-of-page against aggregators with national budgets, that is money lit on fire.

**Before investing, note:** `heathrow parking` and `heathrow long stay parking` both show **YoY minus 90%**. Worth understanding what happened there first.

**Effort:** L. **Risk:** low.

---

## P0 (NEW): claim the three uncontested clusters the keyword research found

The spec above is all remedial. The keyword round also found three clusters with real demand and almost no competition, sitting unclaimed. These are the growth, as opposed to the clean-up.

### 1. Halloween, 10,000/mo at competition index 5. Ships by early September or not at all.

| Term | Volume | Competition index |
|---|---:|---:|
| halloween party near me | 5,000 | **5** (+900% three-month) |
| halloween events near me | 5,000 | **6** |
| halloween night out near me | 50 | 14 |
| fancy dress party near me | 50 | 10 |

`/halloween` already exists and currently carries four h2s. Ten thousand searches a month at index 5 to 6 is the cheapest win in the entire dataset, and Halloween is ten weeks out. Retitle to `Halloween Party Near Heathrow | Fancy-Dress Disco`, build out the sections, ship before the September search ramp.

Avoid `halloween party ideas` (5,000/mo but competition index **100**, and it is craft and DIY intent, not going-out intent).

### 2. Themed quiz nights, 1,250/mo at competition index 0

| Term | Volume | Competition index |
|---|---:|---:|
| gavin and stacey quiz | 500 | **0** |
| only fools and horses quiz | 500 | **2** |
| friends / harry potter / disney quiz night | 50 each | **0** |
| charity quiz night near me | 50 | **0** |
| christmas quiz night near me | 50 | **0** |

Competition index 0 means no advertiser is bidding at all. The category terms (`themed quiz night near me`, `tv quiz night near me`) return no data, so demand attaches to **the named theme, not the category**.

You already run these. Your own listing shows "Lovely Jubbly: Only Fools and Horses Charity Quiz Night, Friday 25 September 2026".

**Build `/quiz-night/themed`** as one hub with a section per theme. No single theme except the top two clears 50/mo, so this is one page, never a page per theme. The dated themed past events 301 into it. `/quiz-night` keeps `pub quiz near me` (5,000/mo); the hub takes only the named-theme terms.

### 3. Retarget `/food-menu` and `/sunday-roast`

The July consolidation plan aimed both at Heathrow-qualified terms. The data says those are the smaller half:

| Page | Currently targets | Should target | Gap |
|---|---|---|---|
| `/food-menu` | menu terms (`pub menu near heathrow`: **no data**) | **pub with food near me** | 500,000/mo, Low (20) |
| `/sunday-roast` | sunday roast near heathrow | **sunday roast near me** | 50,000/mo, Low (29) |

This repeats the Christmas plan's finding that near-me beats Heathrow-qualified about 4:1. Keep the Heathrow qualifier in body copy as the differentiator; it does not belong in the title. **Metadata and lead-copy change only, no rebuild.**

---

## P1: differentiate the funeral venue pages

The 17 `/private-hire/near/*` pages average 33% overlap, but the crematorium and cemetery pages reach **76.9%** (`staines-cemetery` versus `slough-crematorium`).

**Keep every one of them.** Every landmark term returned no GKP data, but that is a measurement limit, not an absence of demand: GKP does not report below roughly 10 searches a month, and GSC shows `/private-hire/near/slough-crematorium` earning **28 clicks / 775 impressions at position 16.4**. These pages win a spread of micro-queries that individually never reach GKP's floor. **Judge this family on GSC only, never on GKP.** The head term for the cluster, `wake venue near me`, carries **£1.69 to £5.06** top-of-page bids, the highest in the whole dataset, which confirms the commercial value.

Give each one genuinely local detail: the actual route and drive time from that specific chapel, parking at that venue, typical service timings, and how the room is set up for a wake of that size. Fix the titles as part of P0.

**Effort:** M. **Risk:** none.

---

## P1: fix the internal link graph

**119 of 226 pages have 2 or fewer inbound internal links.** There are no true orphans, but nothing is being deliberately promoted either. Every page is reachable and no page is prioritised, so internal authority spreads evenly across 226 URLs instead of concentrating on the ones that convert.

Specific gaps found:

- `/private-hire/brochures`, `/private-hire/engagement-parties`, `/heathrow-family-dining`, `/luggage-storage-heathrow`, `/coach-parking-heathrow`, `/live-sport/f1`, `/live-sport/six-nations`: **1 inbound link each**.
- Eight blog posts with commercial intent (`/blog/best-sunday-roast-surrey`, `/blog/corporate-away-day-heathrow`, `/blog/pubs-near-heathrow-free-parking`, `/blog/best-beer-gardens-near-heathrow`, `/blog/pizza-near-heathrow` and others) have **1 inbound link each**.
- `/blog/pub-vs-hotel-celebration-venue`, a 2,483-word article Google has found but not indexed, sits on 1 link.

### The fix

1. Add a **contextual related-links block** to the private-hire and celebration pages pointing at the relevant long-form guides. This is the single highest-leverage change for the blog posts GSC has found but not indexed.
2. Add a **"more like this"** module to blog posts, driven by tag overlap, with 3 or 4 real links.
3. Link the money pages from the homepage and from `/whats-on` explicitly, rather than relying on the footer.
4. Rule: any new long-form post ships with at least 3 inbound links from existing pages, or it does not ship.

**Effort:** M. **Risk:** none. **Highest ratio of effect to effort in this document.**

---

## P1: meta descriptions

75 pages fall outside the 70 to 165 character window. The blog is the worst offender, with descriptions up to **362 characters**. Google truncates at roughly 155 to 160, so more than half of that copy is invisible, and the visible half is often the throat-clearing.

Worst: `/blog/ultimate-guide-to-traveling-as-a-digital-nomad-wit` (362), `/blog/a-personal-pub-for-personal-celebrations` (350), `/blog/sports-update` (328), `/blog/dog-travel-tips` (319).

The templated families also share one description with only a name swapped. Fix those as part of the P0 and consolidation work.

Rewrite all 75 to 140 to 160 characters, leading with the offer or the answer. Add a build-time test asserting the range.

**Effort:** M. **Risk:** none.

---

## P2: schema gaps

No invalid structured data anywhere, but real coverage gaps:

| Gap | Count |
|---|---:|
| Core pages without `BreadcrumbList` | 45 of 75 |
| Event pages without `BreadcrumbList` | 56 of 56 |
| Hotel pages without `BreadcrumbList` | 11 of 11 |
| Town pages without `BreadcrumbList` | 10 of 17 |
| Blog posts without `FAQPage` | 45 of 50 |

Plus the four items the GSC audit already specified, which stand and should ship with this work:

1. Remove `Product` schema from `/fish-and-chips-heathrow`, keep `Menu`/`MenuItem`.
2. Change `/heathrow-parking` `Product` to `Service` with an `Offer`.
3. Remove the live `InStock` offer from the finished `/live-sport/world-cup` event, and prefer removing the `Event` block entirely now the campaign has ended.
4. Stop `app/sitemap.ts` falling back to `event.startDate` for `lastModified`. Future events currently carry future `lastmod` dates. Use `_meta.lastUpdated` only, and omit the field when there is no trustworthy value.

Add `BreadcrumbList` centrally rather than per page. Add `FAQPage` only where a post genuinely answers discrete questions. Do not manufacture questions to earn the markup.

**Effort:** M. **Risk:** low.

---

## P2: restart the content engine

Publishing cadence, by month:

```
2026-08  ####                4   (all Christmas, published in one batch)
2026-07                      0
2026-06                      0
2026-05                      0
2026-04  ################    16
2026-03  #################   17
2026-02  ##                  2
```

33 posts in March and April, then nothing for three months, then a single Christmas batch. The March and April posts are strong, 2,400 to 3,200 words, and they are what the celebration and private-hire cluster now rests on. Then it stopped.

Organic growth on a site this size is mostly a function of sustained publishing against measured demand. One good post a fortnight, each shipped with 3 or more inbound internal links, beats another 30-post burst followed by silence.

Five thin legacy posts should also be retired or merged: `free-pint-offer-this-november` (110 words), `buy-one-get-one-free-on-all-pizza-every-tuesday` (113), `pizza-deals-stanwell-heathrow-tuesdays` (114), `pravha-beer` (122), `stanwell-moor-brew` (123). All are expired offers or single-product notes. 301 them to `/pizza-menu` and `/drinks`.

**Effort:** ongoing. **Risk:** none.

---

## P3: housekeeping

1. **`/sitemap-priority.xml` is stale.** Every `lastmod` reads `2025-01-24`, 19 months old, and every URL in it already appears in the main sitemap. It is a hand-maintained file that has drifted. Recommend deleting it and removing the submission from Search Console; the main sitemap covers everything. A second sitemap asserting false `lastmod` dates is a weak crawl signal, not a strong one.
2. **17 shadowed redirect rules.** `blog-redirects.json` contains 17 rules for `/post/*` slugs that never fire, because `wix-redirects.json` matches first. They resolve correctly today, so this is tidy-up, not a defect. Delete the dead rules and the 15 duplicate sources so the config stops implying behaviour it does not have.
3. **`/whats-on` ships 491KB of HTML**, including 70KB of JSON-LD across 21 blocks. CWV is green so this is not urgent, but it is roughly 3 times the site median (173KB). Emit one merged `@graph` per page rather than 21 separate blocks.
4. **`/private-hire/venue-tour` is `noindex`** and reachable from the private-hire pages. Confirm that is deliberate; an interactive floor plan is good content to have indexed.

---

## Implementation sequence

Each phase is independently deployable and independently verifiable.

Resequenced after the keyword research: Halloween moves to the front because it is seasonal and the window closes, and the two retargets move up because they are metadata-only changes against 550,000/mo of demand.

| Phase | Work | Effort | Expected effect |
|---|---|---|---|
| **0** | **`/halloween` rebuild. Deadline: early September** | S to M | 10,000/mo at competition index 5. Seasonal, so this is now or next year |
| **1** | P0 titles across all 88 pages plus guard test; retarget `/food-menu` and `/sunday-roast` | M | SERP presentation across 39% of the site, plus correct targeting on 550,000/mo of demand |
| **2** | Consolidate 12 hotel pages into `/restaurants-near-heathrow`; GSC audit's four schema and sitemap fixes | M | Removes the largest duplicate-content block |
| **3** | Event quality floor, unique event titles, duplicate data-table fix; build `/quiz-night/themed` | M to L | Retires about 20 thin pages, kills all duplicate titles, claims 1,250/mo at index 0 |
| **4** | Internal linking modules and related-content blocks | M | Best effort-to-effect ratio; unblocks the found-not-indexed posts |
| **5** | Meta description rewrite (75) plus `BreadcrumbList` rollout | M | Click-through rate and rich-result coverage |
| **6** | `/heathrow-parking` retarget to prices; terminal pages de-duplicated; funeral venue differentiation | L | Aims the parking cluster at a term it can actually win |
| **7** | Housekeeping; restart publishing cadence | ongoing | Compounding |

Run the full pipeline (`npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`) at every phase gate, and commit at each gate rather than at the end.

---

## What not to do

- **Do not chase the 695 GSC "not indexed" URLs.** That number is mostly framework assets, tag archives, tracking URLs and deliberate exclusions. The previous audit established this and it remains true.
- **Do not add more programmatic location pages.** The hotel pages are the warning. Volume of near-duplicate pages is the problem being fixed here, not a lever to pull again.
- **Do not touch the town pages.** At 1.1% overlap they are correct.
- **Do not redirect meaningless 404s to the homepage.** A 404 is the right answer for a URL with no equivalent.
- **Do not invent schema values.** No fabricated prices, performers, ratings or review counts to clear an optional warning.
- **Do not spend on Core Web Vitals.** They are green.
- **Do not bid on, or build page strategy around, "heathrow terminal N parking".** 50,000/mo each, but competition index 66 to 72 against Heathrow's own site and aggregators with national budgets.
- **Do not target "halloween party ideas".** 5,000/mo but competition index 100, and it is craft intent, not going-out intent.
- **Do not build a page per quiz theme.** Only two themes clear 50/mo. One hub, sections per theme.
- **Do not judge `/private-hire/near/*` on Keyword Planner.** GKP cannot see below 10/mo; GSC proves these pages earn.
