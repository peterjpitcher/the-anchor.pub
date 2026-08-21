# Implementation spec: site growth programme

**Date:** 17 August 2026
**Status:** ready to build, pending the open decisions at the end
**Strategy:** [growth spec](./site-growth-spec-2026-08-17.md) (what is wrong and why)
**Keyword evidence:** [keyword plan](./keyword-plan-2026-08-17-site-growth.md) (what to target)

This document is the change register. Every file, every redirect, every title. Nothing here is a suggestion to work out later.

---

## Change register

| # | Change | Type | Files | Phase |
|---|---|---|---:|---|
| C1 | Rebuild `/halloween` for the 2026 event | Content | 1 | 0 |
| C2 | Remove doubled brand from 88 page titles | Metadata | ~30 | 1 |
| C3 | Add a title guard test | Test | 1 new | 1 |
| C4 | Remove the nested private-hire title template | Metadata | 1 | 1 |
| C5 | Retarget `/food-menu` and `/sunday-roast` | Metadata | 2 | 1 |
| C6 | Retire 11 hotel pages into `/heathrow-hotels-pub` | Deletion + redirect | 12 del, 2 edit | 2 |
| C7 | Fix `Product` schema on 2 pages | Schema | 2 | 2 |
| C8 | Fix World Cup event schema lifecycle | Schema | 1 | 2 |
| C9 | Stop future `lastmod` dates in the sitemap | Bug | 1 | 2 |
| C10 | Remove the duplicated event data table | Bug | 1 | 3 |
| C11 | Add a past-event quality floor | Logic + redirect | 2 | 3 |
| C12 | Make every event title unique | Metadata | 1 | 3 |
| C13 | Build `/quiz-night/themed` | New page | 1 new | 3 |
| C14 | Add contextual related-links blocks | Component | ~6 | 4 |
| C15 | Rewrite 75 meta descriptions | Metadata | ~40 | 5 |
| C16 | Roll out `BreadcrumbList` centrally | Schema | 3 | 5 |
| C17 | Retarget `/heathrow-parking` to prices | Content | 1 | 6 |
| C18 | De-duplicate the 4 parking terminal pages | Content | 4 | 6 |
| C19 | Differentiate the crematorium page pairs | Content | 1 data file | 6 |
| C20 | Delete `/sitemap-priority.xml` | Housekeeping | 1 del | 7 |
| C21 | Delete 17 shadowed redirect rules | Housekeeping | 1 | 7 |
| C22 | Merge per-page JSON-LD into one `@graph` | Perf | 1 | 7 |
| C23 | Retire 5 thin legacy blog posts | Content + redirect | 5 del, 1 edit | 7 |

**Totals:** 23 changes, roughly 75 files touched, 31 route directories deleted, 35 redirect rules added, 3 new files.

---

## C1. Rebuild `/halloween` (Phase 0, deadline early September)

**Why:** `halloween party near me` 5,000/mo at competition index 5, `halloween events near me` 5,000/mo at index 6. Page exists but carries only 4 h2s.

**Confirmed from the management database, 17 Aug 2026:**

| Field | Value |
|---|---|
| Event name | **Enter If You Dare: The House of Horrors Halloween Party** |
| Date | **Saturday** 31 October 2026 (day of week verified) |
| Time | 20:00 to 00:00 |
| Price | 0.00 (free entry) |
| Status | scheduled |
| Highlights | free entry · fancy dress encouraged · bar open until midnight · free parking |
| Related | A Hint of Halloween Quiz Night, Wednesday 7 Oct, £3 |

> **RESOLVED, 17 Aug 2026.** The naming conflict is fixed. Owner confirmed the event is **House of Horrors**. The management database record `d52cbd18-d293-4516-beca-e151eaa90180` was updated: `short_description`, `long_description`, `meta_title` and `meta_description` all now say House of Horrors, and no customer-facing field mentions Monster Mash.
>
> **The `slug` still contains `monster-mash` and was deliberately left unchanged.** That URL is live and indexed. Renaming it would 404 a page Google already holds, for no search benefit, since slugs carry little ranking weight. If it is ever renamed, it needs a 301 shipped in the same change.
>
> New `meta_title`: `House of Horrors Halloween Party Near Heathrow` (46 chars, 59 with the template, and free of the doubled-brand defect).

**File:** `app/halloween/page.tsx`

- Title: `Halloween Party Near Heathrow | Fancy-Dress Disco` (48 chars before the template)
- H1: Halloween party near Heathrow
- Sections: this year's night (date, time, free entry, fancy dress) · what the night actually is · the Hint of Halloween quiz on 7 Oct · food before · free parking · getting here from Staines, Ashford, Feltham, Stanwell · book a table
- FAQ block (new `FAQPage` schema): is it free, do I have to dress up, is it family-friendly, what time does it start, do I need to book
- Meta description: 140 to 160 chars, leading with free entry and the date

**Do not target** `halloween party ideas` (competition index 100, craft intent).

---

## C2. Remove the doubled brand from 88 titles (Phase 1)

**The rule:** page-level `title` values never contain "The Anchor". The layout template owns the brand suffix.

**Cause:** `app/layout.tsx` sets `template: '%s | The Anchor'`, `app/private-hire/layout.tsx` sets a second template, and pages hard-code the suffix on top.

**Distribution:**

| Family | Pages | Where the fix goes |
|---|---:|---|
| Events | 36 | `app/events/[id]/page.tsx`, strip a trailing brand suffix from the DB `meta_title` before use |
| `/private-hire/near/*` | 17 | `app/private-hire/near/[slug]/page.tsx` `generateMetadata` |
| `/pub-near-*` | 11 | Moot, these pages are deleted in C6 |
| Core pages | 13 | Each page's `metadata` export |
| Blog | 10 | Front-matter `title` in `content/blog/*/index.md` |
| `/private-hire/brochures` | 1 | Page `metadata` export |

**Mechanical transform** (strip every trailing `| The Anchor`, `| Private Hire at The Anchor`, `| The Anchor Stanwell Moor`, and inline `at The Anchor` tails). Verified against all 88. Examples:

| Page | Current (len) | Proposed (len) |
|---|---|---|
| `/quiz-night` | Pub Quiz Near Me \| Wednesday Quiz Night at The Anchor \| The Anchor (66) | Pub Quiz Near Me (16) |
| `/cash-bingo` | Pub Bingo Near Me \| Cash Bingo at The Anchor, Stanwell Moor \| The Anchor (72) | Pub Bingo Near Me (17) |
| `/mothers-day` | Mother's Day Lunch & Sunday Roast Near Staines \| The Anchor \| The Anchor (72) | Mother's Day Lunch & Sunday Roast Near Staines (46) |
| `/valentines-day` | Valentine's & Galentine's Near Heathrow \| The Anchor Stanwell Moor \| The Anchor (79) | Valentine's & Galentine's Near Heathrow (39) |

**14 need manual shortening**, because the transform alone still leaves them over 47 chars (which would exceed 60 once ` | The Anchor` is appended):

| Page | After transform | Len |
|---|---|---:|
| `/private-hire/near/our-lady-of-the-rosary-staines` | Christening & Celebration Venue Near Our Lady of the Rosary RC Church | 69 |
| `/blog/ultimate-guide-to-traveling-as-a-digital-nomad-wit` | Remote Work Near Heathrow: The Anchor Pub as Your Digital Nomad Haven | 69 |
| `/private-hire/near/st-mary-the-virgin-stanwell` | Christening & Celebration Venue Near St Mary the Virgin, Stanwell | 65 |
| `/drinks/managers-special` | August Manager's Special - 25% OFF Jose Cuervo Silver Tequila | 61 |
| `/private-hire/near/st-johns-church-egham` | Christening & Celebration Venue Near St John's Church, Egham | 60 |
| `/new-years-eve` | New Year's Eve Party Near Heathrow \| DJ & Open Until 1am | 56 |
| `/events/st-patricks-day-2026` | Celebrate St Patrick's Day \| Free Jameson with Guinness | 55 |
| `/private-hire/near/spelthorne-registration-office` | Celebration Venue Near Spelthorne Registration Office | 53 |
| `/events/cash-bingo-night-2026-03-18` | Join The Anchor Cash Bingo Night \| Fun & Prizes Await | 53 |
| `/private-hire/near/staines-registration-office` | Celebration Venue Near Staines Registration Office | 50 |
| `/private-hire/near/staines-rugby-club` | Club Event Venue Near Staines Rugby Football Club | 49 |
| `/events/screams-and-soundtracks-classic-horror-music-bingo-2026-10-16` | Screams & Soundtracks: Classic Horror Music Bingo | 49 |
| `/private-hire/near/bedfont-lakes` | Corporate Venue Near Bedfont Lakes Business Park | 48 |
| `/private-hire/near/south-west-middlesex-crematorium` | Wake Venue Near South West Middlesex Crematorium | 48 |

**Fix for the church pages:** shorten the `label` from "Christening & Celebration Venue" to "Christening Venue" in `getMetaForType`. That alone brings all three under 47.

---

## C3. Title guard test (Phase 1)

**New file:** `tests/title-hygiene.test.ts`

Assertions, run over every route's resolved metadata:
1. No resolved title matches `/The Anchor[\s\S]*The Anchor/`.
2. No page-level `title` string contains `The Anchor`.
3. No resolved title exceeds 60 characters.

This is the change that stops the defect coming back. Without it, the next page added reintroduces it.

---

## C4. Remove the nested private-hire title template (Phase 1)

**File:** `app/private-hire/layout.tsx`

Delete the `title.template` override so the branch inherits the single root template. It costs about 22 characters on every page beneath it and adds nothing a user searches for.

---

## C5. Retarget `/food-menu` and `/sunday-roast` (Phase 1)

Metadata and lead copy only. No rebuild.

| File | New title | Head term | Evidence |
|---|---|---|---|
| `app/food-menu/page.tsx` | `Pub With Food Near Me \| Menu & Prices` | pub with food near me | GKP 500,000/mo, Low (20) |
| `app/sunday-roast/page.tsx` | `Sunday Roast Near Me \| Walk-Ins Welcome` | sunday roast near me | GKP 50,000/mo, Low (29) |

Keep the Heathrow qualifier in body copy as the differentiator. `pub menu near heathrow` returned **no data**, so the current target has nothing behind it.

---

## C6. Retire 11 hotel pages into `/heathrow-hotels-pub` (Phase 2, REVISED 17 Aug)

**Both my earlier drafts got the destination wrong.** Draft 1 said consolidate into `/heathrow-hotels-pub`; the keyword data killed that, because "pub near heathrow hotels" has no demand. Draft 2 said delete `/heathrow-hotels-pub` too and send everything to `/restaurants-near-heathrow`. Then I actually measured `/heathrow-hotels-pub`, and that was wrong as well.

| Page | Words | Overlap with `/restaurants-near-heathrow` | Verdict |
|---|---:|---:|---|
| The 11 `/pub-near-*` pages | 873 to 899 | n/a, they are 83.3% duplicates **of each other** | **Delete. Strongly recommended** |
| `/heathrow-hotels-pub` | **1,187**, 12 h2s | **1.1%** | **Keep.** Genuinely unique content |

`/heathrow-hotels-pub` is not a doorway page. It is a substantial page built on a real angle ("escape hotel prices", the alternative to hotel dining) that shares almost nothing with `/restaurants-near-heathrow`. Deleting it would destroy 1,187 words of unique content to solve a problem it is not part of. It is also the natural landing place for the 11 redirects, because it answers the same question they were built for.

**Delete these 11 route directories:**

```
app/pub-near-crowne-plaza-heathrow/
app/pub-near-hilton-heathrow/
app/pub-near-holiday-inn-heathrow/
app/pub-near-ibis-heathrow/
app/pub-near-marriott-heathrow/
app/pub-near-novotel-heathrow/
app/pub-near-premier-inn-heathrow/
app/pub-near-radisson-blu-heathrow/
app/pub-near-renaissance-heathrow/
app/pub-near-sofitel-heathrow/
app/pub-near-travelodge-heathrow/
```

**Also delete:** `components/features/HotelProximityPage.tsx` (no other consumer once the 11 are gone).

**Add to `config/redirects/additional-redirects.json`**, all `statusCode: 301`, all destination **`/heathrow-hotels-pub`**:

```
/pub-near-crowne-plaza-heathrow    /pub-near-novotel-heathrow
/pub-near-hilton-heathrow          /pub-near-premier-inn-heathrow
/pub-near-holiday-inn-heathrow     /pub-near-radisson-blu-heathrow
/pub-near-ibis-heathrow            /pub-near-renaissance-heathrow
/pub-near-marriott-heathrow        /pub-near-sofitel-heathrow
/pub-near-travelodge-heathrow
```

**Edit `app/sitemap.ts`:** remove the 11 `/pub-near-*` entries. **Keep** the `/heathrow-hotels-pub` entry.

**Edit `app/heathrow-hotels-pub/page.tsx`:**
- Absorb the per-hotel detail worth keeping: a short line per hotel with a real drive time, so the 301s land on something that answers the same question.
- Retitle away from the zero-demand term. Current title is `Pub Near Heathrow Hotels | Food, Beer & Free Parking | The Anchor` (doubled brand, and the head term has no data). Proposed: `Escape Heathrow Hotel Prices | Pub Near Your Hotel`, which matches the page's actual angle.
- **Cannibalisation check:** at 1.1% overlap there is no conflict with `/restaurants-near-heathrow` today. Keep it that way. `/restaurants-near-heathrow` keeps `places to eat near heathrow airport`; this page keeps the hotel-alternative angle.

**Before deleting:** capture GSC clicks and impressions for the 11 so the 301s can be judged honestly at 8 weeks.

---

## C7 to C9. Schema and sitemap fixes carried from the GSC audit (Phase 2)

| Change | File | Action |
|---|---|---|
| C7a | `app/fish-and-chips-heathrow/page.tsx` L67 to 113 | Remove the `Product` block, keep `Menu`/`MenuSection`/`MenuItem` |
| C7b | `app/heathrow-parking/page.tsx` L224 to 242 | Change `Product` to `Service` with an `Offer`, keep `ParkingFacility` |
| C8 | `app/live-sport/world-cup/page.tsx` L83 to 126 | Event ended 19 July 2026 but still advertises an `InStock` offer. Remove the `Event` block entirely; leave the page as historical content |
| C9 | `app/sitemap.ts` L315 | `getSafeDate(event._meta?.lastUpdated ?? event.startDate)` produces **future** `lastmod` values. Use `_meta.lastUpdated` only; omit `lastModified` when absent |

Do not add fabricated prices, performers or ratings to clear the remaining optional warnings.

---

## C10. Remove the duplicated event data table (Phase 3)

**Bug, found during the audit.** Every event page renders its data table twice. "More event details" and "Event information" output the same seven fields: date, start time, end time, booking type, event type, category, price.

**File:** `app/events/[id]/page.tsx`

All 56 event pages are padding themselves with a duplicate block. Keep one, delete the other.

---

## C11. Past-event quality floor (Phase 3)

**File:** `lib/event-seo-strategy.ts`

This reverses a documented policy ("past events stay indexed indefinitely"). It is correct for substantial pages and wrong for the ones below. **Owner decision 1 gates this.**

**Rule:** applies only to events whose date has passed.

| Condition | Action |
|---|---|
| `long_description` empty or under 400 chars | 301 to the format hub, drop from sitemap |
| Description length identical to another event's (proven duplicate copy) | 301 to the format hub, drop from sitemap |
| Themed event with its own search demand | 301 to `/quiz-night/themed` |
| Otherwise | Keep live and indexed |

**The 18 retirements, verified against the management database:**

| Slug | Date | Desc chars | Destination | Reason |
|---|---|---:|---|---|
| `quiz-night-april--2025` | 2025-04-02 | **0** | `/quiz-night` | No description at all |
| `cash-bingo-april--2025` | 2025-04-25 | **0** | `/cash-bingo` | No description at all |
| `bank-holiday-sing-along-karaoke-may--2025` | 2025-05-04 | **0** | `/karaoke` | No description at all |
| `quiz-night-may--2025` | 2025-05-07 | **0** | `/quiz-night` | No description at all |
| `cash-bingo-may--2025` | 2025-05-23 | **0** | `/cash-bingo` | No description at all |
| `quiz-night-june--2025` | 2025-06-04 | **0** | `/quiz-night` | No description at all |
| `rum-tasting-night-june--2025` | 2025-06-13 | **0** | `/whats-on` | No description at all |
| `cash-bingo-june--2025` | 2025-06-20 | **0** | `/cash-bingo` | No description at all |
| `quiz-night-july--2025` | 2025-07-02 | **0** | `/quiz-night` | No description at all |
| `nikki-s-karaoke-night-2025-08-22` | 2025-08-22 | 367 | `/karaoke` | Below floor |
| `cash-bingo-2025-07-18` | 2025-07-18 | 617 | `/cash-bingo` | Identical copy, cluster of 5 |
| `bingo-night-2025-08-29` | 2025-08-29 | 617 | `/cash-bingo` | Identical copy, cluster of 5 |
| `bingo-night-2025-09-19` | 2025-09-19 | 617 | `/cash-bingo` | Identical copy, cluster of 5 |
| `bingo-night-2025-10-17` | 2025-10-17 | 617 | `/cash-bingo` | Identical copy, cluster of 5 |
| `bingo-night-2025-11-14` | 2025-11-14 | 617 | `/cash-bingo` | Identical copy, cluster of 5 |
| `quiz-night-pub-pursuit-2025-08-13` | 2025-08-13 | 652 | `/quiz-night` | Duplicate title with back-to-school |
| `pub-quiz-night-2025-10-01` | 2025-10-01 | 1027 | `/quiz-night` | Identical copy and title, pair |
| `pub-quiz-night-2025-11-05` | 2025-11-05 | 1027 | `/quiz-night` | Identical copy and title, pair |

The five 617-char bingo pages share an identical description length **and** an identical `meta_title`. That is the same copy published five times.

**Already handled, no action needed:** the three `drag-cabaret-karaoke-*` and the `live-music-*` / `open-mic-*` events are already excluded by `DISCONTINUED_FORMATS` and `isRetiredEvent()`.

**Renovate, not retire:**

| Slug | Desc chars | Action |
|---|---:|---|
| `gavin-and-stacey-quiz-night-2026-05-15` | 2,519 | 301 to `/quiz-night/themed`, and use this copy as the seed for the hub's Gavin and Stacey section |

---

## C12. Unique event titles (Phase 3)

**File:** `app/events/[id]/page.tsx`

Append the event date to every event title, because the date is what distinguishes one instance from another:

```
Quiz Night at The Anchor, Stanwell Moor, 7 October 2026
```

This alone dissolves all 6 duplicate-title clusters (18 pages) that survive C11.

---

## C13. Build `/quiz-night/themed` (Phase 3)

**Evidence:** 1,250/mo combined at competition index **0 to 2**. `gavin and stacey quiz` 500, `only fools and horses quiz` 500, five more themes at 50 each. The category terms return no data, so demand attaches to named themes only.

**New file:** `app/quiz-night/themed/page.tsx`

- Title: `Themed Quiz Nights Near Heathrow` (32 chars)
- H1: Themed quiz nights at The Anchor
- One section per theme actually run. Confirm each against the events table before naming it. Confirmed so far: Gavin & Stacey (15 May 2026), Only Fools and Horses (25 Sept 2026), A Hint of Halloween (7 Oct 2026)
- Sections: what a themed quiz night is here · a section per theme · how the charity quizzes work · next dates · how to book
- Add to `app/sitemap.ts`
- Link both ways with `/quiz-night`

**Cannibalisation guard:** `/quiz-night` keeps `pub quiz near me` (5,000/mo). The hub takes **only** named-theme terms. Do not let the hub target generic quiz terms.

---

## C14. Contextual related-links blocks (Phase 4)

**Problem:** 119 of 226 pages have 2 or fewer inbound internal links. Highest-leverage change in the programme.

| Target page | Currently | Add links from |
|---|---:|---|
| `/blog/pub-vs-hotel-celebration-venue` | 1 | `/private-hire`, `/private-hire/milestone-birthdays`, `/christmas-parties` |
| `/private-hire/brochures` | 1 | All 8 `/private-hire/*` sub-pages |
| `/private-hire/engagement-parties` | 1 | `/private-hire`, `/private-hire/anniversary-parties` |
| `/blog/best-sunday-roast-surrey` | 1 | `/sunday-roast` |
| `/blog/corporate-away-day-heathrow` | 1 | `/corporate-events` |
| `/blog/pubs-near-heathrow-free-parking` | 1 | `/heathrow-parking`, `/find-us` |
| `/blog/best-beer-gardens-near-heathrow` | 1 | `/beer-garden` |
| `/blog/pizza-near-heathrow` | 1 | `/pizza-menu` |
| `/heathrow-family-dining`, `/luggage-storage-heathrow`, `/coach-parking-heathrow` | 1 each | `/near-heathrow` hub |
| `/live-sport/f1`, `/live-sport/six-nations` | 1 each | `/live-sport` hub |

**Build:** a `RelatedContent` component plus a tag-overlap "more like this" module for blog posts (3 to 4 links).

**Standing rule:** any new long-form post ships with at least 3 inbound links from existing pages, or it does not ship.

---

## C15 to C16. Meta descriptions and breadcrumbs (Phase 5)

**C15:** 75 descriptions exceed 165 characters (none are too short). Rewrite to 140 to 160, leading with the offer or the answer.

| Family | Count |
|---|---:|
| core | 23 |
| blog | 19 |
| ph-near | 17 |
| hotel | 11 (moot after C6) |
| private-hire | 3 |
| events | 2 |

Worst: `/blog/ultimate-guide-to-traveling-as-a-digital-nomad-wit` (362), `/blog/a-personal-pub-for-personal-celebrations` (350), `/blog/sports-update` (328), `/blog/dog-travel-tips` (319).

Add a build-time test asserting the 70 to 165 range, alongside C3.

**C16:** add `BreadcrumbList` centrally, not per page. Missing from 45 core pages, all 56 event pages, and 10 of 17 town pages.

---

## C17 to C19. Parking and venue differentiation (Phase 6)

**C17, `app/heathrow-parking/page.tsx`:** retarget to `heathrow parking prices` (5,000/mo, Low 22). The only winnable parking term in 36 tested. Title `Heathrow Parking Prices Compared`, H1 "What Heathrow parking actually costs". Honest comparison table including transfer time and total real cost. Prices must come from live data; never quote a competitor price without a dated source.

**C18, the 4 terminal pages:** keep them, fix the 64.4% duplication with genuinely terminal-specific content (drive time, drop-off route, airlines served, early-flight timing). Treat as supporting pages linked from the hub. **Do not aim them at "heathrow terminal N parking"**, which sits at competition index 66 to 72 against Heathrow's own site.

**C19, the crematorium pairs:** `staines-cemetery` and `slough-crematorium` are 76.9% identical. Add real route, drive time, parking and typical service timings per venue in the landmark data file. Judge this family on GSC only, never GKP.

---

## C20 to C23. Housekeeping (Phase 7)

| # | Change | Detail |
|---|---|---|
| C20 | Delete `public/sitemap-priority.xml` | Every `lastmod` says `2025-01-24`, 19 months stale, and every URL is already in the main sitemap. Also remove the submission in Search Console |
| C21 | Delete 17 shadowed rules from `config/redirects/blog-redirects.json` | They never fire; `wix-redirects.json` matches first. Also remove the 15 duplicate sources |
| C22 | Merge per-page JSON-LD into one `@graph` | `/whats-on` ships 491KB HTML including 70KB of JSON-LD across 21 blocks, roughly 3x the site median |
| C23 | Retire 5 thin legacy blog posts | `free-pint-offer-this-november` (110 words), `buy-one-get-one-free-on-all-pizza-every-tuesday` (113), `pizza-deals-stanwell-heathrow-tuesdays` (114) → `/pizza-menu`; `pravha-beer` (122), `stanwell-moor-brew` (123) → `/drinks` |

---

## Deployment order and verification gates

Each phase ships independently. Run the full pipeline at every gate and commit there, not at the end.

```bash
npm run lint && npx tsc --noEmit && npm test && npm run build
```

| Gate | Phase | Extra verification |
|---|---|---|
| G0 | C1 | Fetch `/halloween`, confirm the title, the FAQ schema and that the event copy matches the database |
| G1 | C2 to C5 | Re-run the title crawl. Assert zero pages match `/The Anchor.*The Anchor/` and zero titles exceed 60 chars |
| G2 | C6 to C9 | Confirm all 11 `/pub-near-*` URLs return a single-hop 301 to `/heathrow-hotels-pub`, and that `/heathrow-hotels-pub` still returns 200. Confirm no sitemap URL carries a future `lastmod` |
| G3 | C10 to C13 | Confirm zero duplicate event titles across the sitemap. Confirm the 18 retired slugs 301 in one hop. Confirm `/quiz-night/themed` is in the sitemap |
| G4 | C14 | Re-run the inbound-link crawl. Assert no sitemap page has fewer than 3 inbound links |
| G5 | C15 to C16 | Assert all descriptions fall in 70 to 165 chars and `BreadcrumbList` is present site-wide |
| G6 | C17 to C19 | Re-run the 5-gram overlap check. Assert parking terminal overlap is below 30% |
| G7 | C20 to C23 | Re-run the full redirect check from source URLs, following chains end to end |

**Verification note:** check redirects from the **source** URL following the chain, never by fetching a destination in isolation. Destination-only checking produced a false "19 broken redirects" report during this audit; earlier rules shadow later ones.

---

## Rollback

Every phase is a single commit on its own branch. Rollback is `git revert` of that commit, with two exceptions that need care:

- **C6 and C11** delete routes and add redirects. Reverting restores the routes, but Google will have processed the 301s. Reverting after more than a week means the restored pages start from scratch. Decide before shipping, not after.
- **C20** removes a submitted sitemap. Re-add it in Search Console if reverted.

Capture GSC baselines for every affected URL **before** G2 and G3. Without them the 301s cannot be judged.

---

## Decisions, all settled 17 August 2026

1. **Retire the 18 past event pages: APPROVED**, with the instruction "keep any that still add value". The 18 listed in C11 all fail that test on evidence, not judgement: nine have no description at all, five share both an identical description length and an identical `meta_title` (the same copy published five times), two more are an identical pair, and the remaining two sit below the content floor. Every past event with genuinely unique copy stays. `gavin-and-stacey-quiz-night-2026-05-15` is renovated into the themed hub rather than retired, because its 2,519 characters are the seed for a 1,250/mo cluster.
2. **The Halloween naming conflict: RESOLVED.** Owner confirmed House of Horrors. Database updated, see C1.
3. **Delete `/heathrow-hotels-pub`: NO.** The owner asked for deletion only if strongly recommended. It is not. Measurement shows 1,187 words and 1.1% overlap with `/restaurants-near-heathrow`, so it is genuinely unique content and becomes the 301 target for the 11 instead. **Deleting the 11 `/pub-near-*` pages remains strongly recommended** on the 83.3% mutual duplication.

## Remaining owner action

Capture GSC clicks and impressions before G2 and G3 ship, for:
- the 11 `/pub-near-*` URLs
- the 18 event URLs listed in C11

Without these baselines the 301s cannot be judged at the 8-week review, and the decision to retire cannot be validated or reversed on evidence.
