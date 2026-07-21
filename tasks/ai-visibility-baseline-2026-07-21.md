# AI Visibility Baseline, 21 July 2026

Taken the day after the consolidation programme went live, so this is the "before" picture for the AEO/GEO work. Re-run the same eight queries in 6 to 8 weeks and compare.

## Method and limitations (read this before trusting the numbers)

For each query I captured three things: whether `the-anchor.pub` appears in the result set, whether the AI-generated answer **names The Anchor and how prominently**, and **what facts the AI stated about us** (checked against `docs/SSOT.md`).

Honest limitations:
- Search index used is US-weighted, so a UK searcher may see somewhat different local results. Treat rank order as indicative, presence/absence as reliable.
- ChatGPT and Gemini need a logged-in session, which I do not have. Those columns are left for a manual pass (checklist at the bottom, about 15 minutes).
- Google AI Overview presence was not directly observed. Do not claim an AIO appeared without seeing it.
- No figures here are estimated or invented. Anything not measured is marked "not checked".

## Scoreboard

| # | Query | Priority | Anchor in results | Named in AI answer | Framing | Facts accurate |
|---|---|---|---|---|---|---|
| 1 | best pub near Heathrow airport | P1 food | Yes, #1 | **Yes, first** | "Top Recommendation Outside the Airport" | Accurate |
| 2 | restaurants near Heathrow Terminal 5 | **P1 food** | **No** | **No** | Absent entirely | n/a |
| 3 | best Sunday roast near Heathrow | P1 food | Yes, #1 and #2 | **Yes, first** | "Top Recommendation" | **Stale, harmful** |
| 4 | plane spotting pub beer garden Heathrow | P1 traffic | Yes, 8 of 9 slots | **Yes, first** | "The primary option" | Accurate |
| 5 | function room hire near Heathrow Staines | P2 hire | Yes, #1 | **Yes, first** | "Key Venues" | **Stale, banned claim** |
| 6 | wake venue / funeral reception near Staines | P2 hire | Yes, #1 | **Yes, first** | "most relevant and well-established" | Mostly accurate, one overclaim |
| 7 | Christmas party venue near Heathrow | P2 hire | Yes, #6 | Yes, but buried | "Budget-Friendly Alternative" below 4 hotels | Stale |
| 8 | pub quiz near Heathrow / Staines | P3 events | Yes, 8 of 10 slots | **Yes, first** | "The primary option" | Accurate |

**Headline: named first in 6 of 8 queries.** AI visibility is already strong, which matches the GSC picture (visibility largely won). The value is in the two exceptions and the fact-accuracy problem below.

## Finding 1: one large gap, and it is the highest-volume cluster

"Restaurants near Heathrow Terminal 5" returns **no mention of The Anchor at all**. This is the cluster worth roughly 5,000 searches a month (GKP) and the one the consolidation targeted.

Who owns the answer instead:
- Inside the airport: Gordon Ramsay Plane Food, The Globe, Wagamama, Pret.
- Outside: Mr Pizza and Chicken (Stanwell), Harlington Tandoori.
- Aggregators dominating the result set: OpenTable, Tripadvisor, Yelp, SquareMeal, Thistle hotel blog.

Read across from queries 1 and 3: when the query says "pub" or "Sunday roast" we win; when it says "restaurants" we are invisible. The AI does not currently classify The Anchor as a restaurant option, only as a pub.

**Actions:** the newly consolidated `/restaurants-near-heathrow` (live 20 July, re-indexing requested) is the on-site half. The off-site half matters more here, because aggregators supply these answers: an accurate, current presence on OpenTable, Tripadvisor and SquareMeal is likely worth more for this one query than any further page edits.

## Finding 2: AI is confidently repeating facts that are out of date, and one is costing bookings

This is the most valuable thing in the baseline. Every bad claim below has already been fixed or deleted on the live site; the AI is quoting cached versions. Verified against production on 21 July.

| What the AI said | The truth (SSOT) | Live site now | Verdict |
|---|---|---|---|
| Roast: "**Pre-order by 1pm Saturday is required**" | Walk in any time 1pm to 6pm. No pre-order, no Saturday cut-off, since 17 May 2026 | Page states the negative 13 times ("no pre-order", "no Saturday cut-off") | **Stale. Commercially harmful: it tells customers they cannot just turn up.** |
| Roast: "£14.99 to £15.99" | Prices always live from the management DB | No hardcoded price present | Stale |
| Function room: "**free room hire with a minimum spend, typically £500 to £1,500**" | Room hire is discussed on enquiry. Minimum-spend wording is **banned** | No such wording anywhere on `/private-hire` | Stale, likely from the now-deleted `/function-room-hire` page or an aggregator |
| Function room: "20 to 80 guests, 80 to 200 exclusive" | 10+ to 150. Dining room 26 seated / 50 standing. Whole venue 119 seated / 300 standing | Correct figures now published | Stale |
| Christmas: "from £38 per person" | Prices live. The only fixed figure is the £10pp deposit | No £38 on the page. The old page **title** carried it; retitled 20 July | Stale, fixed at source |
| Christmas: "5 minutes from Terminal 5" | 7 minutes | Page says 7 | Stale |
| Wakes: "**wheelchair access throughout**" | Step-free to bar and dining. Garden has steps. **No accessible toilet** | Page explicitly states there is no accessible toilet | **AI overclaim. Accessibility overstatement is a real-world risk, someone could arrive expecting facilities we do not have.** |
| Quiz: "every first Wednesday" | Monthly, dates vary | Page says monthly, dates vary | Stale and over-specific |
| Wakes: "buffet from £12pp", "8 min from Staines Cemetery", "20 free spaces" | Matches SSOT; £12pp is pulled live from the catering API | Correct | **Accurate** |
| Quiz: £3 entry, doors 6:30, start 7pm, £25 bar tab, teams of 6 | Matches SSOT | Correct | **Accurate** |
| Plane spotting: 64-seat garden, dog friendly, free parking, 7 min T5 | Matches SSOT | Correct | **Accurate** |

**What this means.** The SSOT discipline is working where AI has recrawled, and failing only where it has not. The consolidation deleted the pages carrying the worst claims (the minimum-spend wording lived on `/function-room-hire`, now 301'd), so these should decay naturally. The explicit negative statements we added ("no pre-order, no Saturday cut-off") are exactly the right AEO pattern to correct a stale belief, because they give the model an unambiguous sentence to quote.

**The one worth actively pushing:** the Saturday pre-order myth. It is the only stale fact that directly stops someone booking, and it persists because it was true for years. Expect it to take longer to clear than the others.

## Finding 3: Christmas positioning is against hotels, not pubs

For Christmas, the AI answer is structured as four Heathrow hotels (Sofitel, Hilton, Sheraton, Marriott) with The Anchor relegated below as the "budget-friendly alternative". Being cast as the cheap option is not the same as being cast as the better option.

The differentiators the SSOT supports and the hotels cannot match: free parking for every guest, outside the ULEZ, a village pub rather than a conference suite, and one named contact rather than an events desk. Those need to be the hook in the copy and the meta description going into the August to November booking window.

## Manual pass still to do (about 15 minutes, owner)

I could not log into these. Run each query, then record whether The Anchor is named, in what position, and whether any fact stated is wrong.

Queries to use (the same eight, so the comparison holds):
1. best pub near Heathrow airport
2. restaurants near Heathrow Terminal 5
3. best Sunday roast near Heathrow
4. plane spotting pub near Heathrow
5. function room hire near Heathrow
6. wake venue near Staines
7. Christmas party venue near Heathrow
8. pub quiz near Heathrow

Platforms: **ChatGPT** (with search on), **Google** (note whether an AI Overview appears and whether we are cited in it), **Perplexity**, **Gemini**.

Record for each: named yes/no, position, any incorrect fact. Watch particularly for the Saturday pre-order claim, minimum-spend wording, and any accessibility overclaim.

## Re-check plan

- **Re-run this file's eight queries in 6 to 8 weeks** (target mid-September) and diff.
- Success looks like: query 2 gains a mention, and the stale facts in Finding 2 disappear as the consolidated pages are recrawled.
- Christmas query specifically: re-check weekly from mid-August, since that is when the booking decisions are made.
- Pair with the GSC review at the same point, so ranking movement and AI citation movement are read together.
